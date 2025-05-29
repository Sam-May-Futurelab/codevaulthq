import { motion } from 'framer-motion';

const BrowsePage = () => {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Browse <span className="text-vault-accent">Snippets</span>
          </h1>
          <p className="text-xl text-gray-400">
            Discover amazing code from our community
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-8"
        >
          <div className="text-center text-gray-400">
            <p>Browse page will be implemented here</p>
            <p className="mt-2">Features: Advanced filtering, Search, Categories, Pagination</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrowsePage;
