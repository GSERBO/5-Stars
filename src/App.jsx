import React, { useState, useEffect } from 'react';
import './index.css';
import { VALID_WORDS } from './dictionary'; 

// --- THE 7-DAY CONTENT ENGINE ---
const WEEKLY_CHALLENGES = [
  { // Day 0: Sunday
    category: "SPACE",
    levels: [
      { word: "SUN", hint: "The star at the center of our system." },
      { word: "STAR", hint: "A luminous point in the night sky." },
      { word: "ORBIT", hint: "The curved path of a celestial object." },
      { word: "PLANET", hint: "A large body orbiting a star." },
      { word: "ECLIPSE", hint: "When one celestial body obscures another." }
    ]
  },
  { // Day 1: Monday
    category: "LIQUID",
    levels: [
      { word: "WET", hint: "Liquid's primary signature effect." },
      { word: "RAIN", hint: "Water falling from the clouds." },
      { word: "FLUID", hint: "A substance that flows freely." },
      { word: "STREAM", hint: "A continuous flow of liquid." },
      { word: "CURRENT", hint: "The steady flow of a river." }
    ]
  },
  { // Day 2: Tuesday
    category: "TIME",
    levels: [
      { word: "DAY", hint: "Twenty-four hours." },
      { word: "HOUR", hint: "Sixty minutes." },
      { word: "CLOCK", hint: "A mechanical device to tell time." },
      { word: "MINUTE", hint: "Sixty seconds." },
      { word: "CENTURY", hint: "One hundred years." }
    ]
  },
  { // Day 3: Wednesday
    category: "NATURE",
    levels: [
      { word: "OAK", hint: "A large, sturdy tree." },
      { word: "LEAF", hint: "The green foliage of a plant." },
      { word: "GRASS", hint: "Green vegetation that covers lawns." },
      { word: "FLOWER", hint: "The blooming part of a plant." },
      { word: "BLOSSOM", hint: "A flower, especially of a fruit tree." }
    ]
  },
  { // Day 4: Thursday
    category: "LIGHT",
    levels: [
      { word: "RAY", hint: "A narrow beam of light." },
      { word: "GLOW", hint: "A steady radiance." },
      { word: "FLASH", hint: "A sudden, brief burst of light." },
      { word: "BRIGHT", hint: "Radiating or reflecting a lot of light." },
      { word: "RADIANT", hint: "Sending out light; shining or glowing brightly." }
    ]
  },
  { // Day 5: Friday
    category: "SOUND",
    levels: [
      { word: "POP", hint: "A short, sharp, explosive sound." },
      { word: "ECHO", hint: "A sound or series of sounds caused by reflection." },
      { word: "NOISE", hint: "A sound, especially one that is loud or unpleasant." },
      { word: "VOLUME", hint: "The quantity or power of sound; degree of loudness." },
      { word: "THUNDER", hint: "A loud rumbling or crashing noise heard after a lightning flash." }
    ]
  },
  { // Day 6: Saturday
    category: "MIND",
    levels: [
      { word: "EGO", hint: "A person's sense of self-esteem or self-importance." },
      { word: "IDEA", hint: "A thought or suggestion as to a possible course of action." },
      { word: "BRAIN", hint: "An organ of soft nervous tissue contained in the skull." },
      { word: "MEMORY", hint: "The faculty by which the mind stores and remembers information." },
      { word: "THOUGHT", hint: "An idea or opinion produced by thinking." }
    ]
  }
];

const todayIndex = new Date().getDay();
const dailyChallenge = WEEKLY_CHALLENGES[todayIndex];

const todayStr = new Date().toISOString().split('T')[0];

const getInitialState = () => {
  const savedStr = localStorage.getItem('5StarsSave');
  if (savedStr) {
    try {
      const saved = JSON.parse(savedStr);
      if (saved.date === todayStr) {
        return saved;
      }
    } catch (e) {
      console.error("Save file corrupted, starting fresh.");
    }
  }
  return null;
};

const getInitialStats = () => {
  const statsStr = localStorage.getItem('5StarsStats');
  if (statsStr) {
    try {
      return JSON.parse(statsStr);
    } catch (e) {
      console.error("Stats file corrupted, starting fresh.");
    }
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null
  };
};

function App() {
  const [initialState] = useState(getInitialState());

  const [currentLevel, setCurrentLevel] = useState(initialState?.currentLevel ?? 0);
  const targetWord = dailyChallenge.levels[currentLevel].word; 
  
  const [typedLetters, setTypedLetters] = useState(initialState?.typedLetters ?? Array(targetWord.length).fill(''));
  const [revealedLetters, setRevealedLetters] = useState(initialState?.revealedLetters ?? Array(targetWord.length).fill(''));
  const [guessStatus, setGuessStatus] = useState(initialState?.guessStatus ?? 'typing'); 
  const [attempts, setAttempts] = useState(initialState?.attempts ?? 0); 

  const [hasCourtesyStar, setHasCourtesyStar] = useState(initialState?.hasCourtesyStar ?? true);
  const [bankedStars, setBankedStars] = useState(initialState?.bankedStars ?? 0); 
  const [hintUsed, setHintUsed] = useState(initialState?.hintUsed ?? false);
  const [runHistory, setRunHistory] = useState(initialState?.runHistory ?? []);

  const [stats, setStats] = useState(getInitialStats());
  const [showStatsModal, setShowStatsModal] = useState(false);

  const [isShaking, setIsShaking] = useState(false);
  const [toast, setToast] = useState('');
  const [animatingStar, setAnimatingStar] = useState(null); 
  const [showShootingStar, setShowShootingStar] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false); 
  const [showModal, setShowModal] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('5StarsHasSeenHelp');
    if (!hasSeenHelp) {
      setShowHelpModal(true);
      localStorage.setItem('5StarsHasSeenHelp', 'true');
    }
  }, []);

  useEffect(() => {
    const saveData = {
      date: todayStr,
      currentLevel,
      typedLetters,
      revealedLetters,
      guessStatus,
      attempts,
      hasCourtesyStar,
      bankedStars,
      hintUsed,
      runHistory
    };
    localStorage.setItem('5StarsSave', JSON.stringify(saveData));
  }, [currentLevel, typedLetters, revealedLetters, guessStatus, attempts, hasCourtesyStar, bankedStars, hintUsed, runHistory]);

  useEffect(() => {
    localStorage.setItem('5StarsStats', JSON.stringify(stats));
  }, [stats]);

  const showToastNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const processGameEnd = (isWin) => {
    setStats(prevStats => {
      if (prevStats.lastPlayedDate === todayStr) return prevStats;

      const isConsecutiveDay = prevStats.lastPlayedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newStreak = prevStats.currentStreak;

      if (isWin) {
         newStreak = isConsecutiveDay ? prevStats.currentStreak + 1 : 1;
      } else {
         newStreak = 0;
      }

      return {
        gamesPlayed: prevStats.gamesPlayed + 1,
        gamesWon: isWin ? prevStats.gamesWon + 1 : prevStats.gamesWon,
        currentStreak: newStreak,
        maxStreak: Math.max(newStreak, prevStats.maxStreak),
        lastPlayedDate: todayStr
      };
    });
    
    setTimeout(() => {
        setShowStatsModal(true);
    }, 2000); 
  };


  const handleKeyClick = (key) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);

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
      const isBoardFull = targetWord.split('').every((_, i) => revealedLetters[i] !== '' || typedLetters[i] !== '');
      
      if (!isBoardFull) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        return;
      }

      const finalWord = targetWord.split('').map((_, i) => revealedLetters[i] || typedLetters[i]).join('');
      
      if (!VALID_WORDS.includes(finalWord)) {
        showToastNotification("Not in word list");
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([20, 30, 20]); 
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        return; 
      }

      if (finalWord === targetWord) {
        setGuessStatus('correct');
        setShowShootingStar(true); 
        
        const currentOutcome = (attempts === 0 ? '🟩' : '🟨') + (hintUsed ? '⭐' : '');
        setRunHistory(prev => {
          const newHist = [...prev];
          newHist[currentLevel] = currentOutcome;
          return newHist;
        });
        
        setTimeout(() => {
          setShowShootingStar(false);
          if (currentLevel < 4) {
            const nextWord = dailyChallenge.levels[currentLevel + 1].word;
            setBankedStars(prev => prev + 1); 
            setRevealedLetters(Array(nextWord.length).fill(''));
            setTypedLetters(Array(nextWord.length).fill(''));
            setAttempts(0);
            setHintUsed(false);
            setHintText('');
            setGuessStatus('typing');
            setCurrentLevel(currentLevel + 1);
          } else {
            setGuessStatus('summary'); 
            processGameEnd(true); 
          }
        }, 1800);
        return;
      } 
      
      if (attempts === 0) {
        setGuessStatus('incorrect'); 
        showToastNotification("Last Attempt!");
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([20, 30, 20]);
        
        setTimeout(() => {
          const nextRevealed = [...revealedLetters];
          const nextTyped = Array(targetWord.length).fill(''); 
          
          for (let i = 0; i < targetWord.length; i++) {
            const currentLetter = revealedLetters[i] || typedLetters[i];
            if (currentLetter === targetWord[i]) {
              nextRevealed[i] = targetWord[i]; 
            }
          }
          
          setRevealedLetters(nextRevealed);
          setTypedLetters(nextTyped);
          setAttempts(1);
          setGuessStatus('typing'); 
        }, 1700);

      } else if (attempts === 1) {
        setGuessStatus('incorrect'); 
        showToastNotification("Level Failed");
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40, 50, 40]);
        
        setRunHistory(prev => {
          const newHist = [...prev];
          newHist[currentLevel] = '🟥';
          return newHist;
        });

        setTimeout(() => {
          setGuessStatus('failed-reveal'); 
          setRevealedLetters(targetWord.split(''));
          setTypedLetters(Array(targetWord.length).fill(''));
        }, 1800);

        setTimeout(() => {
          if (currentLevel < 4) {
            const nextWord = dailyChallenge.levels[currentLevel + 1].word;
            setRevealedLetters(Array(nextWord.length).fill(''));
            setTypedLetters(Array(nextWord.length).fill(''));
            setAttempts(0);
            setHintUsed(false);
            setHintText('');
            setGuessStatus('typing');
            setCurrentLevel(currentLevel + 1);
          } else {
            setGuessStatus('summary'); 
            processGameEnd(false); 
          }
        }, 5000);
      }
      return;
    }
    
    let firstEmptyIndex = -1;
    for (let i = 0; i < targetWord.length; i++) {
      if (revealedLetters[i] === '' && typedLetters[i] === '') {
        firstEmptyIndex = i;
        break;
      }
    }

    if (firstEmptyIndex !== -1) {
      const newTyped = [...typedLetters];
      newTyped[firstEmptyIndex] = key;
      setTypedLetters(newTyped);
    }
  };

  const handleAction = (type) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
    
    if (type === 'hint' || type === 'letter') {
      if (hasCourtesyStar) {
        setAnimatingStar('courtesy');
        setTimeout(() => { setHasCourtesyStar(false); setAnimatingStar(null); }, 500); 
      } else if (bankedStars > 0) {
        setAnimatingStar('banked');
        setTimeout(() => { setBankedStars(prev => prev - 1); setAnimatingStar(null); }, 500);
      }

      if (type === 'hint') {
        setHintText(`Hint: ${dailyChallenge.levels[currentLevel].hint}`);
      } 
      else if (type === 'letter') {
        const newRevealed = [...revealedLetters];
        const newTyped = [...typedLetters];
        let targetIndex = -1;

        for (let i = 0; i < targetWord.length; i++) {
          if (newRevealed[i] === '' && newTyped[i] !== '' && newTyped[i] !== targetWord[i]) {
            targetIndex = i;
            break;
          }
        }
        if (targetIndex === -1) {
          for (let i = 0; i < targetWord.length; i++) {
            if (newRevealed[i] === '' && newTyped[i] === '') {
              targetIndex = i;
              break;
            }
          }
        }
        if (targetIndex === -1) {
          for (let i = 0; i < targetWord.length; i++) {
            if (newRevealed[i] === '') {
              targetIndex = i;
              break;
            }
          }
        }

        if (targetIndex !== -1) {
          newRevealed[targetIndex] = targetWord[targetIndex];
          newTyped[targetIndex] = ''; 
          setRevealedLetters(newRevealed);
          setTypedLetters(newTyped);
        }
      }
      setHintUsed(true);
    }
    setShowModal(false);
  };

  const handleShare = () => {
    const grid = runHistory.map((outcome, i) => `L${i + 1}: ${outcome}`).join('\n');
    const starString = Array(bankedStars).fill('⭐').join('');
    const shieldString = hasCourtesyStar ? '🌟 Intact' : '🌟 Lost';
    
    const shareText = `5 Stars | Daily ${dailyChallenge.category} Category\n${grid}\nBank: ${starString || 'None'} | ${shieldString}\n\nCheck out my score in 5-Stars! Can you beat it?\n[Link to your game here]`;
    
    navigator.clipboard.writeText(shareText);
    showToastNotification("Results & Challenge copied!");
  };

  const renderBoxes = () => {
    if (guessStatus === 'summary') return null;

    return Array(targetWord.length).fill('').map((_, i) => {
      const isRevealed = revealedLetters[i] !== '';
      const isTyped = !isRevealed && typedLetters[i] !== '';
      const letter = revealedLetters[i] || typedLetters[i] || '';
      
      let boxClass = 'empty';
      if (isRevealed) boxClass = 'correct'; 
      else if (isTyped) boxClass = 'typing';

      if (guessStatus === 'incorrect' && isTyped) boxClass = 'incorrect';
      if (guessStatus === 'failed-reveal') boxClass = 'failed-reveal'; 
      if ((guessStatus === 'correct' || guessStatus === 'won') && letter) boxClass = 'correct';

      const isAnimating = guessStatus === 'correct' || guessStatus === 'incorrect';
      const flipClass = isAnimating ? ' flip-animate' : '';
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

  const renderConfetti = () => {
    const colors = ['#d4af37', '#538d4e', '#ffffff'];
    return (
      <div className="confetti-container">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="confetti-piece" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)]
          }}></div>
        ))}
      </div>
    );
  };

  const isPerfectRun = !runHistory.includes('🟥') && hasCourtesyStar;

  return (
    <div className="game-container">
      {toast && <div className="toast">{toast}</div>}
      {guessStatus === 'summary' && isPerfectRun && renderConfetti()}
      {showShootingStar && <div className="shooting-star">⭐</div>}

      <div className="logo-container">
        <img src="/logo.png" alt="5 Stars" className="main-logo" />
      </div>

      <header className="header">
        <div className="header-left">
          <button className="icon-btn" onClick={() => setShowMenu(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="header-center">
          <div className="level-text">
            {guessStatus !== 'summary' ? (
              <><strong>Level {currentLevel + 1}</strong> &nbsp;• {targetWord.length} Letters</>
            ) : (
              <strong>Daily Complete</strong>
            )}
          </div>
        </div>

        <div className="header-right">
          <div className="stars">
            {animatingStar === 'banked' && <span className={`star-icon star-dissolving`}>⭐</span>}
            {Array.from({ length: bankedStars }).map((_, i) => (
              <span key={`banked-${i}`} className="star-icon">⭐</span>
            ))}
            {hasCourtesyStar && bankedStars > 0 && <span style={{ margin: '0 4px', color: '#565758' }}>|</span>}
            {hasCourtesyStar && <span className={`star-icon ${animatingStar === 'courtesy' ? 'star-dissolving' : ''}`}>🌟</span>}
          </div>
        </div>
      </header>

      {showMenu && (
        <div className="menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="side-menu" onClick={e => e.stopPropagation()}>
            <button className="icon-btn menu-close" onClick={() => setShowMenu(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <button className="menu-item" onClick={() => { setShowMenu(false); setShowStatsModal(true); }}>
              📊 Statistics
            </button>
            <button className="menu-item" onClick={() => { setShowMenu(false); setShowHelpModal(true); }}>
              📖 How to Play
            </button>
            <button className="menu-item" style={{color: '#818384', cursor: 'not-allowed'}}>
              ⚙️ Settings (Coming Soon)
            </button>
          </div>
        </div>
      )}

      {showStatsModal && (
         <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{width: '300px'}}>
               <h2 style={{textAlign: 'center', marginBottom: '15px'}}>STATISTICS</h2>
               <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '20px', textAlign: 'center'}}>
                  <div>
                     <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.gamesPlayed}</div>
                     <div style={{fontSize: '0.75rem', color: '#818384'}}>Played</div>
                  </div>
                  <div>
                     <div style={{fontSize: '2rem', fontWeight: 'bold'}}>
                        {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}
                     </div>
                     <div style={{fontSize: '0.75rem', color: '#818384'}}>Win %</div>
                  </div>
                  <div>
                     <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.currentStreak}</div>
                     <div style={{fontSize: '0.75rem', color: '#818384'}}>Current<br/>Streak</div>
                  </div>
                  <div>
                     <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.maxStreak}</div>
                     <div style={{fontSize: '0.75rem', color: '#818384'}}>Max<br/>Streak</div>
                  </div>
               </div>
               
               {guessStatus === 'summary' && (
                   <button className="share-button" onClick={handleShare} style={{justifyContent: 'center'}}>
                      Share Results 📋
                   </button>
               )}

               <button className="modal-btn" style={{marginTop: '10px'}} onClick={() => setShowStatsModal(false)}>
                  Close
               </button>
            </div>
         </div>
      )}

      <div className="game-area">
        {guessStatus !== 'summary' ? (
          <>
            {/* --- NEW: GOLD CATEGORY HIGHLIGHT --- */}
            <div className="category-title">
              DAILY CATEGORY: <span className="category-highlight">{dailyChallenge.category}</span>
            </div>
            
            {currentLevel > 0 && (
              <div className="word-bank">
                {dailyChallenge.levels.slice(0, currentLevel).map((level, i) => (
                  <span key={i} className="word-bank-item">
                    L{i + 1}: <span className="word-bank-word">{level.word}</span>
                  </span>
                ))}
              </div>
            )}
            
            <div className={`board ${isShaking ? 'shake' : ''}`}>{renderBoxes()}</div>
            {hintText && <div className="hint-display">{hintText}</div>}
          </>
        ) : (
          <div className="summary-screen">
            <h2 style={{color: isPerfectRun ? '#d4af37' : '#ffffff', fontSize: '1.8rem'}}>
              {isPerfectRun ? '6-Star Run Complete!' : 'Daily Run Finished'}
            </h2>
            <div style={{lineHeight: '1.8', fontSize: '1.1rem', textAlign: 'left', marginBottom: '20px'}}>
              {runHistory.map((outcome, i) => (
                <div key={i}>Level {i + 1}: {outcome}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="action-area">
        {guessStatus === 'typing' && !hintUsed && (hasCourtesyStar || bankedStars > 0) && (
          <button className="hint-button" onClick={() => setShowModal(true)}>
            ⭐ Use Hint
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-btn" onClick={() => handleAction('hint')}>Get Hint</button>
            <button className="modal-btn" onClick={() => handleAction('letter')}>Reveal Letter</button>
            <button className="modal-btn" style={{background:'#538d4e'}} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="modal-overlay">
          <div className="modal-content help-modal">
            <div className="help-content">
              <h2>How to Play</h2>
              <ul>
                <li>Solve the word to advance. Each puzzle connects to the <strong>DAILY CATEGORY</strong> and the previous word.</li>
                <li>You get <strong>1 Free Guess</strong>. If you miss, you enter the high-stakes <strong>Last Attempt</strong>.</li>
                <li>In your Last Attempt, you must either risk a second blind guess, or <strong>Wager a Star</strong> to reveal a hint.</li>
                <li><strong>🌟 Courtesy Star:</strong> Your free star. Used first if you ask for help.</li>
                <li><strong>⭐ Banked Stars:</strong> Earn 1 for every level you beat.</li>
                <li>Beat all 5 levels without losing a star to achieve a perfect <strong>6-Star Run!</strong></li>
              </ul>
            </div>
            <button className="modal-btn" style={{background:'#538d4e', marginTop: '10px'}} onClick={() => setShowHelpModal(false)}>
              Let's Play
            </button>
          </div>
        </div>
      )}

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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
            {['Z','X','C','V','B','N','M'].map(k => (
              <button key={k} className="key" onClick={() => handleKeyClick(k)}>{k}</button>
            ))}
            <button className="key wide" onClick={() => handleKeyClick('⌫')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM18 9l-6 6M12 9l6 6"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;