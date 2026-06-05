import React, { useState, useEffect } from 'react';
import './index.css';
import { VALID_WORDS } from './dictionary'; 

// --- CLOOBLE DATA ENGINE ---
const WEEKLY_CLOOBLES = [
  { // Day 0: Sunday
    category: "TIME",
    levels: [
      { 
        word: "CLOCK", 
        freeHint: "Often tells you if you’re a punctual person.", // Only Level 1 gets a freeHint
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
        // No freeHint here. Will be blank until they click "Get Cloo".
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
        // No freeHint here.
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

const todayIndex = new Date().getDay();
const dailyChallenge = WEEKLY_CLOOBLES[todayIndex] || WEEKLY_CLOOBLES[0];
const todayStr = new Date().toISOString().split('T')[0];

const AFFIRMATIONS = [
  "You’re a smart cookie! 🍪", 
  "Look at you!! 👀", 
  "A genius at work! 🧠", 
  "Looks good! The word does too! ✨"
];

// --- STATS SYSTEM ---
const loadStats = () => {
  const saved = localStorage.getItem('CloobleStats');
  return saved ? JSON.parse(saved) : { played: 0, perfectRuns: 0, totalCloosSaved: 0 };
};
const saveStats = (stats) => {
  localStorage.setItem('CloobleStats', JSON.stringify(stats));
};

function App() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const targetWord = dailyChallenge.levels[currentLevel].word; 
  
  const [typedLetters, setTypedLetters] = useState(Array(targetWord.length).fill(''));
  const [guessStatus, setGuessStatus] = useState('typing'); 
  
  const [clooBank, setClooBank] = useState(5);
  const [currentCloo, setCurrentCloo] = useState(-1); 
  const [levelScores, setLevelScores] = useState([null, null, null]); 
  
  const [affirmation, setAffirmation] = useState("");
  const [hintExpanded, setHintExpanded] = useState(true); // NEW: The +/- Toggle State
  const [stats, setStats] = useState(loadStats());
  
  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGamesHub, setShowGamesHub] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
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
      
      if (!VALID_WORDS.includes(finalWord)) {
        showToastNotification("Not A Word");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        return; 
      }

      if (finalWord !== targetWord) {
        setGuessStatus('incorrect');
        setIsShaking(true);
        
        setTimeout(() => {
          setGuessStatus('typing');
          setIsShaking(false);
          setTypedLetters(Array(targetWord.length).fill(''));
          
          if (clooBank === 0 && currentCloo < 4) {
             setCurrentCloo(prev => prev + 1);
             setHintExpanded(true); // Auto-expand if the game forces a clue
          }
        }, 1000);
        return;
      } 
      
      setGuessStatus('correct');
      const pointEarned = currentCloo < 4; 
      
      const newScores = [...levelScores];
      newScores[currentLevel] = pointEarned;
      setLevelScores(newScores);

      setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

      setTimeout(() => {
        setAffirmation("");
        
        if (currentLevel < 2) {
          const nextWord = dailyChallenge.levels[currentLevel + 1].word;
          setTypedLetters(Array(nextWord.length).fill(''));
          setGuessStatus('typing');
          setCurrentLevel(currentLevel + 1);
          
          if (clooBank === 0) {
             setCurrentCloo(0);
             setHintExpanded(true);
          } else {
             setCurrentCloo(-1); 
             setHintExpanded(true);
          }
        } else {
          setGuessStatus('summary'); 
          
          // Process Final Stats
          const newStats = {
            played: stats.played + 1,
            perfectRuns: clooBank === 5 ? stats.perfectRuns + 1 : stats.perfectRuns,
            totalCloosSaved: stats.totalCloosSaved + clooBank
          };
          setStats(newStats);
          saveStats(newStats);
        }
      }, 2500); 
      
      return;
    }
    
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
      setHintExpanded(true); 
    }
  };

  // --- NEW CANVAS SHARE FOR CLOOBLE ---
  const handleShare = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#151515';
    ctx.fillRect(0, 0, 600, 400);

    ctx.fillStyle = '#E8E8E4';
    ctx.font = '300 44px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('C L O O B L E', 300, 75);

    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#D4AF37';
    ctx.fillText(`CATEGORY: ${dailyChallenge.category}`, 300, 115);

    if (guessStatus === 'summary') {
      let rating = "UM, OK...";
      let ratingColor = "#888888";
      if (clooBank === 5) { rating = "AMAZING!"; ratingColor = "#D4AF37"; }
      else if (clooBank >= 3) { rating = "NICE WORK!"; ratingColor = "#538D4E"; }
      else if (clooBank === 2) { rating = "NOT BAD"; ratingColor = "#E8E8E4"; }

      ctx.fillStyle = ratingColor;
      ctx.font = '800 32px sans-serif';
      ctx.fillText(rating, 300, 170);

      ctx.fillStyle = '#E8E8E4';
      ctx.font = '400 20px sans-serif';
      levelScores.forEach((score, index) => {
        const text = `Level ${index + 1}: ${score ? '✅ Correct' : '❌ Giveaway Used'}`;
        ctx.fillText(text, 300, 220 + (index * 35));
      });

      ctx.font = '700 22px sans-serif';
      ctx.fillStyle = '#D4AF37';
      ctx.fillText(`Cloos Saved: ${clooBank}/5`, 300, 350);
    }

    try {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'clooble-share.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'CLOOBLE',
            text: guessStatus === 'summary' ? `I saved ${clooBank} Cloos today!` : `Can you beat today's Clooble?`
          });
        } else {
          navigator.clipboard.writeText(`Play CLOOBLE!\nCategory: ${dailyChallenge.category}\nhttps://5-stars-phi.vercel.app/`).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); 
          });
        }
      }, 'image/png');
    } catch (e) {
      console.error(e);
    }
  };

  const renderBoxes = () => {
    if (guessStatus === 'summary') return null;

    return Array(targetWord.length).fill('').map((_, i) => {
      const letter = typedLetters[i];
      let boxClass = letter ? 'typing' : 'empty';

      if (guessStatus === 'incorrect' && letter) boxClass = 'incorrect';
      if (guessStatus === 'correct' && letter) boxClass = 'correct';

      const flipClass = (guessStatus === 'correct') ? ' flip-animate' : '';
      const animationDelay = guessStatus === 'correct' ? `${i * 0.15}s` : '0s';

      return (
        <div key={i} className={`letter-box ${boxClass}${flipClass}`} style={{ animationDelay }}>
           {letter}
        </div>
      );
    });
  };

  let endRating = "";
  let endColor = "";
  if (clooBank === 5) { endRating = "AMAZING!"; endColor = "#D4AF37"; }
  else if (clooBank >= 3) { endRating = "NICE WORK!"; endColor = "#538D4E"; }
  else if (clooBank === 2) { endRating = "NOT BAD"; endColor = "#E8E8E4"; }
  else { endRating = "UM, OK..."; endColor = "#888888"; }

  // Determines what the current hint text is (if any exists)
  const currentHintText = currentCloo === -1 
    ? dailyChallenge.levels[currentLevel].freeHint 
    : dailyChallenge.levels[currentLevel].cloos[currentCloo];

  return (
    <div className="game-container">
      {toast && <div className="toast">{toast}</div>}
      
      {affirmation && (
         <div className="affirmation-toast">
            {affirmation}
         </div>
      )}

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
              <button className="menu-link-btn" onClick={() => { setShowStatsModal(true); setIsMenuOpen(false); }}>
                Statistics
              </button>
              <button className="menu-link-btn" onClick={() => { setShowHelpModal(true); setIsMenuOpen(false); }}>
                How to Play
              </button>
              <button className="menu-link-btn" onClick={() => { handleShare(); setIsMenuOpen(false); }}>
                {isCopied ? "Copied!" : "Share Graphic"}
              </button>
              <button className="menu-link-btn" onClick={() => { setShowGamesHub(true); setIsMenuOpen(false); }}>
                More Games
              </button>
            </nav>
          </div>
          <div className="menu-footer">v1.0.0</div>
        </div>
      </div>

      {/* --- STATS MODAL --- */}
      {showStatsModal && (
        <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-abs" onClick={() => setShowStatsModal(false)}>✕</button>
            <h2 className="modal-title">STATISTICS</h2>
            
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-num">{stats.played}</span>
                <span className="stat-label">Played</span>
              </div>
              <div className="stat-box">
                <span className="stat-num">{stats.perfectRuns}</span>
                <span className="stat-label">Perfects</span>
              </div>
              <div className="stat-box">
                <span className="stat-num">
                  {stats.played > 0 ? Math.round(stats.totalCloosSaved / stats.played) : 0}
                </span>
                <span className="stat-label">Avg Saved</span>
              </div>
            </div>
            
            <button className="hub-btn" onClick={handleShare}>
              {isCopied ? "SAVED!" : "SHARE GRAPHIC"}
            </button>
          </div>
        </div>
      )}

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
                <li>You get a Free Hint on Level 1, and <strong>5 Cloos</strong> in your Cloobank.</li>
                <li>Stuck? Spend a Cloo from your bank to reveal the next hint.</li>
                <li><strong>Auto-Assist:</strong> If you run out of Cloos, the game will automatically force clues on you if you guess incorrectly.</li>
                <li><strong>Scoring:</strong> Cloo 5 is a dead giveaway. You only get credit for a level if you solve it before Cloo 5 is revealed. Win the game by saving your Cloobank!</li>
              </ul>
            </div>
            {/* FIX 1: Removed the 'current' class so the Let's Play button works! */}
            <button className="hub-btn" style={{marginTop: '10px'}} onClick={() => setShowHelpModal(false)}>
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
            
            <div className="level-text" style={{ textAlign: 'center', margin: '15px 0' }}>
              <strong>Level {currentLevel + 1} of 3</strong>
            </div>
            
            <div className={`board ${isShaking ? 'shake' : ''}`}>{renderBoxes()}</div>
            
            {/* FIX 2, 4, 5, 6: The completely overhauled Collapsible Hint UI */}
            {currentHintText && (
              <div className="hint-display-container">
                <div className="hint-toggle-bar" onClick={() => setHintExpanded(!hintExpanded)}>
                  <span className="hint-label">
                    {currentCloo === -1 ? "CLOO" : `CLOO ${currentCloo + 1}/5`}
                  </span>
                  <span className="hint-icon">{hintExpanded ? "−" : "+"}</span>
                </div>
                {hintExpanded && (
                  <div className="hint-text">
                    {currentHintText}
                  </div>
                )}
              </div>
            )}

            {/* ONLY show the Get Cloo button if they have cloos and aren't at the limit */}
            <div className="action-area" style={{ marginTop: currentHintText ? '15px' : '30px' }}>
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

            <button className="hub-btn" style={{marginTop: '20px'}} onClick={handleShare}>
              {isCopied ? "SAVED!" : "SHARE GRAPHIC"}
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