import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
    Button, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    CircularProgress, 
    Alert,
    Container,
    LinearProgress,
    Box,
    IconButton
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlay, faArrowLeft, faEye, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import './Quizzes.css';

// Quiz Taker Component
function QuizTaker({ quiz, onFinish, onBack }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [reviewMode, setReviewMode] = useState(false);

    const handleAnswer = (answer) => {
        const newAnswers = { ...userAnswers, [currentQuestionIndex]: answer };
        setUserAnswers(newAnswers);

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Calculate score
            let correctAnswers = 0;
            quiz.questions.forEach((question, index) => {
                if (newAnswers[index] === question.correctAnswer) {
                    correctAnswers++;
                }
            });
            const finalScore = (correctAnswers / quiz.questions.length) * 100;
            setScore(finalScore);
            setShowResults(true);
        }
    };

    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    const handleReview = () => {
        setReviewMode(true);
        setCurrentQuestionIndex(0);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setReviewMode(false);
            setShowResults(true);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    if (showResults && !reviewMode) {
        return (
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="h4" gutterBottom>Quiz Results</Typography>
                    <Typography variant="h5" gutterBottom>
                        Your Score: {score.toFixed(1)}%
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Correct Answers: {Math.round((score / 100) * quiz.questions.length)} out of {quiz.questions.length}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleReview}
                        startIcon={<FontAwesomeIcon icon={faEye} />}
                        sx={{ mt: 2, mr: 2 }}
                    >
                        Review Answers
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={onBack}
                        startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
                        sx={{ mt: 2 }}
                    >
                        Back to Quizzes
                    </Button>
                </Box>
            </Container>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
                <Button 
                    onClick={onBack}
                    startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
                    sx={{ mb: 2 }}
                >
                    Back to Quizzes
                </Button>
                <Typography variant="h4" gutterBottom>{quiz.title}</Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ mb: 2 }}
                />
                <Typography variant="subtitle1" gutterBottom>
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </Typography>
                <Card sx={{ mb: 3, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {currentQuestion.question}
                    </Typography>
                    <Grid container spacing={2}>
                        {currentQuestion.options.map((option, index) => (
                            <Grid item xs={12} key={index}>
                                <Button
                                    variant={userAnswers[currentQuestionIndex] === option ? "contained" : "outlined"}
                                    fullWidth
                                    onClick={() => !reviewMode && handleAnswer(option)}
                                    sx={{ 
                                        justifyContent: "flex-start", 
                                        textAlign: "left",
                                        backgroundColor: reviewMode && option === currentQuestion.correctAnswer ? "#4caf50" : 
                                                         reviewMode && userAnswers[currentQuestionIndex] === option && option !== currentQuestion.correctAnswer ? "#f44336" : "",
                                        color: reviewMode && (option === currentQuestion.correctAnswer || userAnswers[currentQuestionIndex] === option) ? "white" : ""
                                    }}
                                >
                                    {option}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    {reviewMode && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" color="textSecondary">
                                Correct Answer: {currentQuestion.correctAnswer}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Button 
                                    onClick={handlePrevQuestion} 
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Previous
                                </Button>
                                <Button 
                                    onClick={handleNextQuestion}
                                >
                                    {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Review' : 'Next'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Card>
            </Box>
        </Container>
    );
}

// Main Quizzes Component
function Quizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        setError(null);
        setIsLoading(true);

        const user = auth.currentUser;
        if (user) {
            try {
                const quizzesRef = collection(db, 'users', user.uid, 'quizzes');
                const q = query(quizzesRef, orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);
                const quizzesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setQuizzes(quizzesData);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
                setError("Error fetching quizzes. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        } else {
            navigate('/signin');
        }
    };

    const handleDelete = async (event, quizId) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            const user = auth.currentUser;
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'quizzes', quizId));
                fetchQuizzes();
            } catch (error) {
                console.error("Error deleting quiz:", error);
                setError("Error deleting quiz. Please try again later.");
            }
        }
    };

    const handleStartQuiz = (quiz) => {
        setCurrentQuiz(quiz);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (currentQuiz) {
        return (
            <QuizTaker 
                quiz={currentQuiz} 
                onFinish={(results) => {
                    console.log('Quiz finished', results);
                    setCurrentQuiz(null);
                }}
                onBack={() => setCurrentQuiz(null)}
            />
        );
    }

    return (
        <Container maxWidth="lg" className="quizzes-container">
             <Typography variant="h4" className="page-title" gutterBottom>
        <FontAwesomeIcon icon={faQuestionCircle} className="title-icon" />
        My Quizzes
      </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {quizzes.length === 0 ? (
                <Box className="no-quizzes-container">
                <Typography variant="body1" className="no-quizzes-message">
                    <FontAwesomeIcon icon={faQuestionCircle} className="no-quizzes-icon" />
                    You haven't created any quizzes yet. Generate a quiz from your notes!
                </Typography>
            </Box>
        ) : (
                <Grid container spacing={3}>
                    {quizzes.map((quiz) => (
                        <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                            <Card className="quiz-card">
                                <CardContent>
                                    <Typography variant="h6" className="quiz-title">
                                        {quiz.title}
                                    </Typography>
                                    <Typography variant="body2" className="quiz-timestamp">
                                        {quiz.timestamp && new Date(quiz.timestamp.toDate()).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" className="quiz-info">
                                        From Note: {quiz.noteTitle || 'Untitled Note'}
                                    </Typography>
                                    <Typography variant="body2" className="quiz-info">
                                        Questions: {quiz.questions ? quiz.questions.length : 0}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<FontAwesomeIcon icon={faPlay} />}
                                        onClick={() => handleStartQuiz(quiz)}
                                        className="start-button"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        Start Quiz
                                    </Button>
                                    <IconButton 
                                        className="delete-icon"
                                        onClick={(e) => handleDelete(e, quiz.id)}
                                        aria-label="delete quiz"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default Quizzes;