import React, { useState, useEffect } from 'react';
import './index.css';
import { VALID_WORDS } from './dictionary'; 

// --- THE CLOOBLE CONTENT ENGINE ---
const WEEKLY_CLOOBLES = [
  { // Day 0: Sunday
    category: "TIME",
    levels: [
      { 
        word: "CLOCK", 
        freeHint: "Often tells you if you’re a punctual person.", 
        cloos: [
          "The Sun and Moon comes at a certain point",
          "Numbers",
          "Helpful if you’re making plans",
          "Tik Tok",
          "Rhymes with 'Block'"
        ]
      },
      { 
        word: "TIME", 
        freeHint: "You are now on Level 2. Ready?", 
        cloos: [
          "Sometimes called a father",
          "You make it for the people you care about",
          "Day and Night",
          "If you want to know, look at the last answer",
          "I ain’t got (blank) for that"
        ]
      },
      { 
        word: "WATCH", 
        freeHint: "The final level. Don't go broke!", 
        cloos: [
          "Has multiple meanings",
          "Can be iced out, sporty, or classy",
          "If you can’t find time, you might need to get one",
          "A Wearable",
          "Portable clock"
        ]
      }
    ]
  }
  // Add Day 1 to Day 6 here...
];

// Fallback to Day 0 if other days aren't built yet
const todayIndex = new Date().getDay();
const dailyChallenge = WEEKLY_CLOOBLES[todayIndex] || WEEKLY_CLOOBLES[0];
const todayStr = new Date().toISOString().split('T')[0];

const AFFIRMATIONS = [
  "You’re a smart cookie! 🍪", 
  "Look at you!! 👀", 
  "A genius at work! 🧠", 
  "Looks good! The word does too! ✨"
];

function App() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const targetWord = dailyChallenge.levels[currentLevel].word; 
  
  const [typedLetters, setTypedLetters] = useState(Array(targetWord.length).fill(''));
  const [guessStatus, setGuessStatus] = useState('typing'); 
  
  // --- CLOOBLE MECHANICS ---
  const [clooBank, setClooBank] = useState(5);
  // -1 = Free Hint. 0-4 = Cloos 1-5.
  const [currentCloo, setCurrentCloo] = useState(-1); 
  // Tracks if they solved each level legitimately (before Cloo 5)
  const [levelScores, setLevelScores] = useState([null, null, null]); 
  
  const [affirmation, setAffirmation] = useState("");
  
  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGamesHub, setShowGamesHub] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [isShaking, setIsShaking] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('CloobleHasSeenHelp');
    if (!hasSeenHelp) {
      setShowHelpModal(true);
      localStorage.setItem('CloobleHasSeenHelp', 'true');
    }
  }, []);

  const showToastNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleKeyClick = (key) => {
    if (guessStatus !== 'typing') return;

    if (key === '⌫') {
      let lastTypedIndex = -1;
      for (let i = targetWord.length - 1; i >= 0; i--) {
        if (typedLetters[i] !== '') {
          lastTypedIndex = i;
          break;
        }
      }
      if (lastTypedIndex !== -1) {
        const newTyped = [...typedLetters];
        newTyped[lastTypedIndex] = '';
        setTypedLetters(newTyped);
      }
      return;
    }

    if (key === 'ENTER') {
      const isBoardFull = typedLetters.every(letter => letter !== '');
      if (!isBoardFull) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        return;
      }

      const finalWord = typedLetters.join('');
      
      // 1. Check for typos/invalid words
      if (!VALID_WORDS.includes(finalWord)) {
        showToastNotification("Not A Word");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        return; 
      }

      // 2. Check for Incorrect Guess (Valid word, wrong answer)
      if (finalWord !== targetWord) {
        setGuessStatus('incorrect');
        setIsShaking(true);
        
        setTimeout(() => {
          setGuessStatus('typing');
          setIsShaking(false);
          setTypedLetters(Array(targetWord.length).fill(''));
          
          // AUTO-ASSIST PENALTY: If broke, force the next Cloo for free
          if (clooBank === 0 && currentCloo < 4) {
             setCurrentCloo(prev => prev + 1);
          }
        }, 1000);
        return;
      } 
      
      // 3. CORRECT GUESS
      setGuessStatus('correct');
      const pointEarned = currentCloo < 4; // True if they didn't use Cloo 5
      
      setLevelScores(prev => {
        const newScores = [...prev];
        newScores[currentLevel] = pointEarned;
        return newScores;
      });

      // Show random affirmation
      setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

      setTimeout(() => {
        setAffirmation("");
        
        if (currentLevel < 2) {
          // Move to Next Level
          const nextWord = dailyChallenge.levels[currentLevel + 1].word;
          setTypedLetters(Array(nextWord.length).fill(''));
          setGuessStatus('typing');
          setCurrentLevel(currentLevel + 1);
          
          // If broke entering new level, automatically show Cloo 1 instead of Free Hint
          if (clooBank === 0) {
             setCurrentCloo(0);
          } else {
             setCurrentCloo(-1); 
          }
        } else {
          // End Game
          setGuessStatus('summary'); 
        }
      }, 2500); // Wait for affirmation animation
      
      return;
    }
    
    // Type a letter
    let firstEmptyIndex = typedLetters.findIndex(l => l === '');
    if (firstEmptyIndex !== -1) {
      const newTyped = [...typedLetters];
      newTyped[firstEmptyIndex] = key;
      setTypedLetters(newTyped);
    }
  };

  const handleGetCloo = () => {
    if (clooBank > 0 && currentCloo < 4) {
      setClooBank(prev => prev - 1);
      setCurrentCloo(prev => prev + 1);
    }
  };

  const renderBoxes = () => {
    if (guessStatus === 'summary') return null;

    return Array(targetWord.length).fill('').map((_, i) => {
      const letter = typedLetters[i];
      let boxClass = letter ? 'typing' : 'empty';

      if (guessStatus === 'incorrect' && letter) boxClass = 'incorrect';
      if (guessStatus === 'correct' && letter) boxClass = 'correct';

      const isAnimating = guessStatus === 'correct' || guessStatus === 'incorrect';
      const flipClass = (guessStatus === 'correct') ? ' flip-animate' : '';
      const animationDelay = isAnimating ? `${i * 0.15}s` : '0s';

      return (
        <div 
           key={i} 
           className={`letter-box ${boxClass}${flipClass}`}
           style={{ animationDelay }}
        >
           {letter}
        </div>
      );
    });
  };

  // End Game Calculation
  let endRating = "";
  let endColor = "";
  if (clooBank === 5) { endRating = "AMAZING!"; endColor = "#D4AF37"; }
  else if (clooBank >= 3) { endRating = "NICE WORK!"; endColor = "#538D4E"; }
  else if (clooBank === 2) { endRating = "NOT BAD"; endColor = "#E8E8E4"; }
  else { endRating = "UM, OK..."; endColor = "#888888"; }

  return (
    <div className="game-container">
      {toast && <div className="toast">{toast}</div>}
      
      {/* AFFIRMATION POPUP */}
      {affirmation && (
         <div className="affirmation-toast">
            {affirmation}
         </div>
      )}

      {/* CONFETTI (Only for Amazing and Nice Work) */}
      {guessStatus === 'summary' && clooBank >= 3 && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: ['#D4AF37', '#538D4E', '#FFFFFF'][Math.floor(Math.random() * 3)]
            }}></div>
          ))}
        </div>
      )}

      <header className="app-header">
        <button className="menu-btn" onClick={() => setIsMenuOpen(true)}>☰</button>
        <div className="header-center-text">CLOOBLE</div>
        <div className="cloo-bank-display">
          Cloos: <span className="cloo-count">{clooBank}</span>
        </div>
      </header>

      {/* --- MENU OVERLAY --- */}
      <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
          
          <div className="menu-content">
            <h2 className="menu-title">MENU</h2>
            <nav className="menu-links" style={{ marginTop: '30px' }}>
              <button className="menu-link-btn" onClick={() => { setShowHelpModal(true); setIsMenuOpen(false); }}>
                How to Play
              </button>
              <button className="menu-link-btn" onClick={() => { setShowGamesHub(true); setIsMenuOpen(false); }}>
                More Games
              </button>
            </nav>
          </div>
          <div className="menu-footer">v1.0.0</div>
        </div>
      </div>

      {/* --- GAMES HUB MODAL --- */}
      {showGamesHub && (
        <div className="modal-overlay" onClick={() => setShowGamesHub(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-abs" onClick={() => setShowGamesHub(false)}>✕</button>
            <h2 className="modal-title">GAMES HUB</h2>
            
            <a href="https://kryptex-game.vercel.app/" target="_blank" rel="noopener noreferrer" className="hub-btn">
              KRYPTEX
              <span className="hub-sub">Play now ↗</span>
            </a>
            
            <a href="#" className="hub-btn current" onClick={(e) => e.preventDefault()}>
              CLOOBLE
              <span className="hub-sub">You are currently playing</span>
            </a>
            
            <a href="#" className="hub-btn disabled" onClick={(e) => e.preventDefault()}>
              THE NUMBERS GAME
              <span className="hub-sub">Coming Soon</span>
            </a>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="modal-overlay">
          <div className="modal-panel help-modal">
            <button className="close-btn-abs" onClick={() => setShowHelpModal(false)}>✕</button>
            <h2 className="modal-title">HOW TO PLAY</h2>
            <div className="help-content">
              <ul>
                <li>Solve 3 connected words based on the <strong>DAILY CATEGORY</strong>.</li>
                <li>You get a Free Hint to start, and <strong>5 Cloos</strong> in your Cloobank.</li>
                <li>Stuck? Spend a Cloo from your bank to reveal the next hint.</li>
                <li><strong>Auto-Assist:</strong> If you run out of Cloos, the game will automatically force clues on you if you guess incorrectly.</li>
                <li><strong>Scoring:</strong> Cloo 5 is a dead giveaway. You only get credit for a level if you solve it before Cloo 5 is revealed. Win the game by saving your Cloobank!</li>
              </ul>
            </div>
            <button className="hub-btn current" style={{marginTop: '10px'}} onClick={() => setShowHelpModal(false)}>
              Let's Play
            </button>
          </div>
        </div>
      )}

      <div className="game-area">
        {guessStatus !== 'summary' ? (
          <>
            <div className="category-title">
              DAILY CATEGORY: <span className="category-highlight">{dailyChallenge.category}</span>
            </div>
            
            <div className="level-text" style={{ textAlign: 'center', marginBottom: '25px' }}>
              <strong>Level {currentLevel + 1} of 3</strong>
            </div>
            
            <div className={`board ${isShaking ? 'shake' : ''}`}>{renderBoxes()}</div>
            
            {/* THE CLOO DISPLAY AREA */}
            <div className="hint-display">
              <div className="hint-label">
                {currentCloo === -1 ? "FREE HINT" : `CLOO ${currentCloo + 1}/5`}
              </div>
              <div className="hint-text">
                {currentCloo === -1 
                  ? dailyChallenge.levels[currentLevel].freeHint 
                  : dailyChallenge.levels[currentLevel].cloos[currentCloo]}
              </div>
            </div>

            <div className="action-area" style={{ marginTop: '20px' }}>
              {guessStatus === 'typing' && clooBank > 0 && currentCloo < 4 && (
                <button className="hint-button" onClick={handleGetCloo}>
                  🔍 Get Cloo
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="summary-screen">
            <h1 className="summary-rating" style={{ color: endColor }}>{endRating}</h1>
            
            <div className="summary-stats-box">
               <div className="summary-stat-row">
                 <span>Level 1:</span>
                 <span>{levelScores[0] ? '✅ Correct' : '❌ Giveaway Used'}</span>
               </div>
               <div className="summary-stat-row">
                 <span>Level 2:</span>
                 <span>{levelScores[1] ? '✅ Correct' : '❌ Giveaway Used'}</span>
               </div>
               <div className="summary-stat-row">
                 <span>Level 3:</span>
                 <span>{levelScores[2] ? '✅ Correct' : '❌ Giveaway Used'}</span>
               </div>
            </div>

            <div className="summary-bank">
               Cloos Remaining: <strong>{clooBank}</strong>
            </div>

            <button className="hub-btn" style={{marginTop: '20px'}} onClick={() => window.location.reload()}>
              Play Again (Debug)
            </button>
          </div>
        )}
      </div>

      {guessStatus !== 'summary' && (
        <div className="keyboard">
          <div className="keyboard-row">
            {['Q','W','E','R','T','Y','U','I','O','P'].map(k => (
              <button key={k} className="key" onClick={() => handleKeyClick(k)}>{k}</button>
            ))}
          </div>
          <div className="keyboard-row">
            {['A','S','D','F','G','H','J','K','L'].map(k => (
              <button key={k} className="key" onClick={() => handleKeyClick(k)}>{k}</button>
            ))}
          </div>
          <div className="keyboard-row">
            <button className="key wide" onClick={() => handleKeyClick('ENTER')}>
              ENTER
            </button>
            {['Z','X','C','V','B','N','M'].map(k => (
              <button key={k} className="key" onClick={() => handleKeyClick(k)}>{k}</button>
            ))}
            <button className="key wide" onClick={() => handleKeyClick('⌫')}>
              ⌫
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;