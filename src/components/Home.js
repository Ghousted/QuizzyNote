// Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Avatar,
  useTheme,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faLightbulb, 
  faQuestionCircle, 
  faShield, 
  faBolt, 
  faBrain,
  faArrowRight,
  faUserPlus,
  faPenToSquare,
  faWandMagicSparkles,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import './Home.css';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  padding: theme.spacing(15, 0),
  color: 'white',
  textAlign: 'center',
  borderRadius: '0 0 50px 50px',
  marginBottom: theme.spacing(6),
  overflow: 'hidden', // Add overflow hidden for visual effects
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Add subtle shadow
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)' // Enhance shadow on hover
  },
}));

const StepCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Add subtle shadow
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)' // Enhance shadow on hover
  },
}));

function Home() {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    { icon: faBook, title: 'Organized Notes', description: 'Create and organize notes efficiently' },
    { icon: faLightbulb, title: 'AI-Generated Flashcards', description: 'Convert notes to flashcards automatically' },
    { icon: faQuestionCircle, title: 'Smart Quizzes', description: 'Test your knowledge with AI-generated quizzes' },
    { icon: faShield, title: 'Secure Platform', description: 'Your data is safe and encrypted' },
    { icon: faBolt, title: 'Fast & Intuitive', description: 'Simple and easy to use interface' },
    { icon: faBrain, title: 'Smart Learning', description: 'AI-powered learning optimization' },
  ];

  const steps = [
    { number: '1', icon: faUserPlus, title: 'Sign Up', description: 'Create your free account' },
    { number: '2', icon: faPenToSquare, title: 'Add Notes', description: 'Start creating your notes' },
    { number: '3', icon: faWandMagicSparkles, title: 'Generate Materials', description: 'Create flashcards and quizzes' },
    { number: '4', icon: faGraduationCap, title: 'Learn', description: 'Study and track your progress' },
  ];

  const goToNotes = () => {
    navigate('/dashboard/notes');
  };

  return (
    <Box>
      <HeroSection>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold',  marginBottom: '20px' }}>
            Welcome to QuizzyNote
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ marginBottom: '30px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Your ultimate study companion
          </Typography>
          <Button variant="contained" color="secondary" size="large" onClick={goToNotes}>
            Get Started <FontAwesomeIcon icon={faArrowRight} />
          </Button>
        </Container>
      </HeroSection>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', margin: '40px 0' }}>
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard>
                <CardContent>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56, marginBottom: 2 }}>
                    <FontAwesomeIcon icon={feature.icon} size="lg" />
                  </Avatar>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ margin: '40px 0' }} />
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', margin: '40px 0' }}>
          How It Works
        </Typography>
        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StepCard elevation={3}>
                <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', marginRight: 2 }}>
                  {step.number}
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>
                  <FontAwesomeIcon icon={step.icon} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </StepCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;