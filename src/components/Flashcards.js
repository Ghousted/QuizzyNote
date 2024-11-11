import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  deleteDoc,
  doc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress,
  IconButton,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faSync, 
  faChevronDown, 
  faCreditCard,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import './Flashcards.css';

function Flashcards() {
  const [flashcardGroups, setFlashcardGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        setLoading(true);
        const flashcardsRef = collection(db, 'users', user.uid, 'flashcards');
        const q = query(flashcardsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const groupedFlashcards = {};
        querySnapshot.docs.forEach(doc => {
          const flashcard = {
            id: doc.id,
            ...doc.data()
          };
          const noteTitle = flashcard.noteTitle || 'Ungrouped';
          if (!groupedFlashcards[noteTitle]) {
            groupedFlashcards[noteTitle] = [];
          }
          groupedFlashcards[noteTitle].push(flashcard);
        });

        setFlashcardGroups(groupedFlashcards);
        setError(null);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setError("Error loading flashcards. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (event, flashcardId) => {
    event.stopPropagation(); // Prevent card flip when deleting
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      const user = auth.currentUser;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'flashcards', flashcardId));
        await fetchFlashcards();
      } catch (error) {
        console.error("Error deleting flashcard:", error);
        setError("Error deleting flashcard. Please try again later.");
      }
    }
  };

  const handleDeleteGroup = async (event, noteTitle) => {
    event.stopPropagation(); // Prevent accordion from toggling
    if (window.confirm(`Are you sure you want to delete all flashcards for "${noteTitle}"?`)) {
      const user = auth.currentUser;
      try {
        const batch = writeBatch(db);
        const flashcardsToDelete = flashcardGroups[noteTitle];
        flashcardsToDelete.forEach(flashcard => {
          const flashcardRef = doc(db, 'users', user.uid, 'flashcards', flashcard.id);
          batch.delete(flashcardRef);
        });
        await batch.commit();
        await fetchFlashcards();
      } catch (error) {
        console.error("Error deleting flashcard group:", error);
        setError("Error deleting flashcard group. Please try again later.");
      }
    }
  };

  const handleFlip = (cardId) => {
    setFlippedCards(prev => ({...prev, [cardId]: !prev[cardId]}));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const groupTitles = Object.keys(flashcardGroups);
  if (groupTitles.length === 0) {
    return (
      <Box className="flashcards-container">
        <Typography variant="h4" className="page-title" gutterBottom>
          <FontAwesomeIcon icon={faCreditCard} className="title-icon" />
          My Flashcards
        </Typography>
        
        <Box className="no-flashcards-container">
          <Typography variant="body1" className="no-flashcards-message">
            <FontAwesomeIcon icon={faCreditCard} className="no-flashcards-icon" />
            You haven't created any flashcards yet. Generate flashcards from your notes!
          </Typography>
        </Box>
      </Box>
    );
}
  return (
    <Box className="flashcards-container">
        <Typography variant="h4" className="page-title" gutterBottom>
            <FontAwesomeIcon icon={faCreditCard} className="title-icon" />
            My Flashcards
        </Typography>
        
        <Button 
            onClick={fetchFlashcards} 
            startIcon={<FontAwesomeIcon icon={faSync} />}
            variant="outlined"
            className="refresh-button"
        >
            Refresh Flashcards
        </Button>

        <Box className="groups-container">
            <Typography variant="h6" className="section-title" gutterBottom>
                <FontAwesomeIcon icon={faLayerGroup} className="section-icon" />
                Flashcard Collections
            </Typography>
            
            {Object.entries(flashcardGroups).map(([noteTitle, flashcards]) => (
                <Accordion 
                    key={noteTitle}
                    className="flashcard-group-accordion"
                >
                    <AccordionSummary
                        expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
                        className="group-summary"
                    >
                        <Typography className="group-title">
                            <FontAwesomeIcon icon={faCreditCard} className="group-icon" />
                            {noteTitle} 
                            <span className="card-count">
                                ({flashcards.length} cards)
                            </span>
                        </Typography>
                        <Typography variant="body2" className="group-timestamp">
                            {flashcards[0].timestamp && new Date(flashcards[0].timestamp.toDate()).toLocaleString()}
                        </Typography>
                        <IconButton 
                            onClick={(e) => handleDeleteGroup(e, noteTitle)}
                            className="delete-group-button"
                            size="small"
                            aria-label="delete group"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </IconButton>
                    </AccordionSummary>
                    <AccordionDetails className="group-details">
                        <Grid container spacing={2} className="cards-grid">
                            {flashcards.map((flashcard) => (
                                <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                                    <Card 
                                        className={`flashcard ${flippedCards[flashcard.id] ? 'flipped' : ''}`}
                                        onClick={() => handleFlip(flashcard.id)}
                                    >
                                        <CardContent className="flashcard-content">
                                            <div className="flashcard-inner">
                                                <div className="flashcard-front">
                                                    <Typography variant="h6" className="card-text">
                                                        {flashcard.front}
                                                    </Typography>
                                                </div>
                                                <div className="flashcard-back">
                                                    <Typography variant="body1" className="card-text">
                                                        {flashcard.back}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <IconButton 
                                                onClick={(e) => handleDelete(e, flashcard.id)}
                                                className="delete-button"
                                                size="small"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </IconButton>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    </Box>
);
}

export default Flashcards;