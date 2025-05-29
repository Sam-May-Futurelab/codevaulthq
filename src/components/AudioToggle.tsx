import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import AudioFeedback from '../utils/AudioFeedback';

const AudioToggle = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const audio = AudioFeedback.getInstance();

  const toggleAudio = () => {
    const newState = audio.toggle();
    setIsEnabled(newState);
    if (newState) {
      audio.playSuccess();
    }
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleAudio}
      className={`audio-toggle ${!isEnabled ? 'disabled' : ''}`}
      title={isEnabled ? 'Disable sound effects' : 'Enable sound effects'}
    >
      {isEnabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </motion.button>
  );
};

export default AudioToggle;
