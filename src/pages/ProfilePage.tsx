import { motion } from 'framer-motion';

const ProfilePage = () => {
  return (
    <div className="min-h-screen">
      <div className="pt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            User <span className="text-vault-purple">Profile</span>
          </h1>
          <p className="text-xl text-gray-400">
            Creator dashboard and public profile
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-12"
        >
          <div className="text-center text-gray-400">
            <p className="text-lg mb-6">Profile page will be implemented here</p>
            <p>Features: User info, Snippet gallery, Analytics, Social links</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
