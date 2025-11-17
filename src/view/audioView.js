// View of Audio functions.

// 
// Variables:
// 
let isHardBGMPlaying = false;

// 
// Functions:
// 
function playHardBGM() {
  // If already playing, do nothing
  if (isHardBGMPlaying) return;

  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bgmHard', { vol: 0.35, loop: true });
    isHardBGMPlaying = true;
  } 
  else if (typeof bgmHard !== 'undefined' && bgmHard && typeof bgmHard.play === 'function') {
    // Only play if not already playing
    if (bgmHard.paused || bgmHard.currentTime === 0) {
      bgmHard.loop = true;
      bgmHard.volume = 0.35;
      bgmHard.play();
      isHardBGMPlaying = true;
    }
  }
}

function stopHardBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.stop('bgmHard');
          isHardBGMPlaying=false;
  } else if (typeof bgmHard !== 'undefined' && bgmHard && typeof bgmHard.play === 'function') {
    bgmHard.stop('bgmHard');
    isHardBGMPlaying=false;
  }
}

function playBossBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bgmBoss', { vol: 0.35, loop:true }); // Play "bgmBoss" from the Audio Manager:
  } else if (typeof bgmBoss !== 'undefined' && bgmBoss && typeof bgmBoss.play === 'function') {
    bgmBoss.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function stopBossBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.stop('bgmBoss');
  } else if (typeof bgmBoss !== 'undefined' && bgmBoss && typeof bgmBoss.play === 'function') {
    bgmBoss.stop('bgmBoss');
  }
}

function playMenuBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('mainMenu', { vol: 0.35, loop:true }); // Play "mainMenu" from the Audio Manager:
  } else if (typeof mainMenu !== 'undefined' && mainMenu && typeof mainMenu.play === 'function') {
    mainMenu.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function stopMenuBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.stop('mainMenu');
  } else if (typeof mainMenu !== 'undefined' && mainMenu && typeof mainMenu.play === 'function') {
    mainMenu.stop('mainMenu');
  }
}

function playBonusBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bonusBGM', { vol: 0.35, loop:true }); // Play "bonusBGM" from the Audio Manager:
  } else if (typeof bonusBGM !== 'undefined' && bonusBGM && typeof bonusBGM.play === 'function') {
    bonusBGM.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function stopBonusBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.stop('bonusBGM');
  } else if (typeof bonusBGM !== 'undefined' && bonusBGM && typeof bonusBGM.play === 'function') {
    bonusBGM.stop('bonusBGM');
  }
}

function playBossHit(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bossHit', { vol: 1, loop:false }); // Play "bossHit" from the Audio Manager:
  } else if (typeof bossHit !== 'undefined' && bossHit && typeof bossHit.play === 'function') {
    bossHit.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function playBossKill(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bossKill', { vol: 0.5, loop:false }); // Play "bossKill" from the Audio Manager:
  } else if (typeof bossKill !== 'undefined' && bossKill && typeof bossKill.play === 'function') {
    bossKill.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function playMenuSFX(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('sfxMenu', { vol: 1.0 }); // Play "sfxMenu" from the Audio Manager:
  } else if (typeof sfxMenu !== 'undefined' && sfxMenu && typeof sfxMenu.play === 'function') {
    sfxMenu.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}
