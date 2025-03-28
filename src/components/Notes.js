import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, Card, CardContent, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faFileAlt, faBolt, faQuestionCircle, faBook } from '@fortawesome/free-solid-svg-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Notes.css';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

function Notes() {
  const [recentNotes, setRecentNotes] = useState([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentNotes();
  }, []);

  const fetchRecentNotes = async () => {
    setError(null);
    setIsLoading(true);

    const user = auth.currentUser;
    if (user) {
      try {
        const notesRef = collection(db, 'users', user.uid, 'notes');
        const q = query(notesRef, orderBy('timestamp', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const notesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentNotes(notesData);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setError("Error fetching notes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    } else {
      navigate('/signin');
    }
  };

  const handleNewNote = () => {
    setIsEditing(true);
    setContent('');
    setTitle('');
    setCurrentNoteId(null);
  };

  const handleEditNote = (note) => {
    setIsEditing(true);
    // Clean up the content by removing extra line breaks and spaces
    const cleanContent = note.content
      .replace(/<p><br><\/p>/g, '<p></p>') // Remove empty paragraphs with breaks
      .replace(/(<p>(\s|&nbsp;)*<\/p>)+/g, '<p></p>') // Remove paragraphs with only spaces
      .replace(/(<p><\/p>){2,}/g, '<p></p>'); // Reduce multiple empty paragraphs to one
  
    setContent(cleanContent);
    setTitle(note.title);
    setCurrentNoteId(note.id);
  };

  const handleSave = async () => {
    setError(null);
    const user = auth.currentUser;
    if (user) {
      try {
        // Clean up content before saving
        const cleanContent = content
          .replace(/<p><br><\/p>/g, '<p></p>')
          .replace(/(<p>(\s|&nbsp;)*<\/p>)+/g, '<p></p>')
          .replace(/(<p><\/p>){2,}/g, '<p></p>')
          .trim();
  
        if (currentNoteId) {
          const noteRef = doc(db, 'users', user.uid, 'notes', currentNoteId);
          await updateDoc(noteRef, {
            title,
            content: cleanContent,
            timestamp: serverTimestamp()
          });
        } else {
          const notesRef = collection(db, 'users', user.uid, 'notes');
          await addDoc(notesRef, {
            title,
            content: cleanContent,
            timestamp: serverTimestamp()
          });
        }
        setIsEditing(false);
        setCurrentNoteId(null);
        fetchRecentNotes();
      } catch (error) {
        console.error("Error saving note:", error);
        setError("Error saving note. Please try again later.");
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentNoteId(null);
    setContent('');
    setTitle('');
  };

  const handleDelete = async (event, noteId) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      const user = auth.currentUser;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
        fetchRecentNotes();
      } catch (error) {
        console.error("Error deleting note:", error);
        setError("Error deleting note. Please try again later.");
      }
    }
  };

  const generateFlashcards = async () => {
    if (!content) {
      setError('Please enter some note content before generating flashcards.');
      return;
    }

    setIsGeneratingFlashcards(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

      const prompt = `Generate flashcards from this note content. Format as JSON array with "front" (question) and "back" (answer) properties. Keep answers concise.

      Note content:
      ${content}

      Expected format:
      {
        "flashcards": [
          {
            "front": "Question 1",
            "back": "Answer 1"
          },
          // ... more card
        ]
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let flashcardsData;

      try {
        const responseText = response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }
        flashcardsData = JSON.parse(jsonMatch[0]);
        
        if (!flashcardsData.flashcards || !Array.isArray(flashcardsData.flashcards)) {
          throw new Error('Invalid flashcards format');
        }
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        setError("Error generating flashcards: Invalid format received.");
        return;
      }

      const user = auth.currentUser;
      if (user && flashcardsData.flashcards.length > 0) {
        const batch = writeBatch(db);
        const flashcardsRef = collection(db, 'users', user.uid, 'flashcards');

        flashcardsData.flashcards.forEach((flashcard) => {
          const newFlashcardRef = doc(flashcardsRef);
          batch.set(newFlashcardRef, {
            front: flashcard.front,
            back: flashcard.back,
            noteId: currentNoteId,
            noteTitle: title,
            timestamp: serverTimestamp()
          });
        });

        await batch.commit();
        alert(`${flashcardsData.flashcards.length} flashcards generated and saved successfully!`);
      }

    } catch (error) {
      console.error("Error generating flashcards:", error);
      setError("Error generating flashcards. Please try again later.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const generateQuiz = async () => {
    if (!content) {
      setError('Please enter some note content before generating a quiz.');
      return;
    }

    setIsGeneratingQuiz(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Generate a 20-item multiple choice quiz based on this content. Format as JSON with the following structure:
      {
        "quiz": {
          "title": "Quiz Title",
          "questions": [
            {
                            "question": "Question text",
              "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
              "correctAnswer": "A) option1"
            }
          ]
        }
      }

      Note content:
      ${content}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let quizData;

      try {
        const responseText = response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }
        quizData = JSON.parse(jsonMatch[0]);
        
        if (!quizData.quiz || !quizData.quiz.questions || !Array.isArray(quizData.quiz.questions)) {
          throw new Error('Invalid quiz format');
        }
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        setError("Error generating quiz: Invalid format received.");
        return;
      }

      const user = auth.currentUser;
      if (user && quizData.quiz.questions.length > 0) {
        const quizzesRef = collection(db, 'users', user.uid, 'quizzes');
        await addDoc(quizzesRef, {
          title: quizData.quiz.title || title,
          questions: quizData.quiz.questions,
          noteId: currentNoteId,
          noteTitle: title,
          timestamp: serverTimestamp()
        });

        alert(`Quiz generated and saved successfully!`);
      }

    } catch (error) {
      console.error("Error generating quiz:", error);
      setError("Error generating quiz. Please try again later.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  if (isEditing) {
    return (
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title"
          style={{ 
            marginBottom: '15px', 
            width: '100%', 
            padding: '12px',
            fontSize: '18px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            boxSizing: 'border-box'
          }}
        />
        <div className="editor-container">
        <ReactQuill 
            value={content} 
            onChange={setContent}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image'],
                ['clean']
              ]
            }}
            formats={[
              'header',
              'bold', 'italic', 'underline', 'strike',
              'list', 'bullet',
              'color', 'background',
              'link', 'image'
            ]}
          />
        </div>
        <div style={{ 
          marginTop: '20px',
          display: 'flex',
          gap: '10px'
        }}>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary" 
            size="large"
          >
            {currentNoteId ? 'Update Note' : 'Save Note'}
          </Button>
          <Button 
            onClick={handleCancel} 
            variant="outlined" 
            color="secondary"
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={generateFlashcards}
            variant="contained"
            color="success"
            size="large"
            startIcon={<FontAwesomeIcon icon={faBolt} />}
            disabled={isGeneratingFlashcards}
          >
            {isGeneratingFlashcards ? 'Generating...' : 'Generate Flashcards'}
          </Button>
          <Button
            onClick={generateQuiz}
            variant="contained"
            color="info"
            size="large"
            startIcon={<FontAwesomeIcon icon={faQuestionCircle} />}
            disabled={isGeneratingQuiz}
          >
            {isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </div>
        {error && <Alert severity="error" style={{ marginTop: '15px' }}>{error}</Alert>}
      </div>
    );
  }

  return (
    <>
    <div className="notes-container">
      <Typography variant="h4" className="page-title" gutterBottom>
        <FontAwesomeIcon icon={faBook} className="title-icon" />
          My Notes
      </Typography>
      <div className="new-note-button-container">
        <Button 
          onClick={handleNewNote} 
          className="new-note-button"
          variant="contained" 
          color="primary" 
        >
          <FontAwesomeIcon icon={faFileAlt} className="document-icon" />
          <FontAwesomeIcon icon={faPlus} className="plus-icon" />
        </Button>
        <Typography className="new-note-label">
          Add New Note
        </Typography>
      </div>
      <hr></hr>

      {error && <Alert severity="error" style={{ marginBottom: '10px' }}>{error}</Alert>}

      <Typography variant="h6" className="recent-notes-title">Recent Notes</Typography>

      {isLoading && <CircularProgress />}

      {!isLoading && (
        <Grid container spacing={3}>
          {recentNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Card 
                onClick={() => handleEditNote(note)}
                className="note-card"
              >
                <CardContent>
                  <FontAwesomeIcon icon={faFileAlt} className="note-icon" />
                  <div className="note-content">
                    <Typography variant="h6" className="note-title">
                      {note.title}
                    </Typography>
                    <Typography variant="body2" className="note-timestamp">
                      {note.timestamp && new Date(note.timestamp.toDate()).toLocaleString()}
                    </Typography>
                    <Typography 
                      variant="body1"
                      className="note-preview"
                    >
                      <div dangerouslySetInnerHTML={{ __html: note.content }} />
                    </Typography>
                  </div>
                  <FontAwesomeIcon 
                    icon={faTrash} 
                    className="delete-icon"
                    onClick={(e) => handleDelete(e, note.id)}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!isLoading && recentNotes.length === 0 && (
        <Typography variant="body1" className="no-notes-message">
          No notes yet. Start by creating a new note!
        </Typography>
      )}
    </div>
    </>
  );
}

export default Notes;
