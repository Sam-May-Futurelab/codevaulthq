import FirebaseDbService from '../services/FirebaseDbService';

/**
 * Debug utility to verify Firebase Firestore connectivity and data operations
 */
export class FirebaseDebug {
  
  /**
   * Test basic Firestore connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔥 Testing Firebase Firestore connection...');
      
      // Try to get platform stats (reads from multiple collections)
      const stats = await FirebaseDbService.getPlatformStats();
      console.log('✅ Firebase connection successful!', stats);
      
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  }

  /**
   * Test creating a sample snippet to verify write operations
   */
  static async testCreateSnippet(): Promise<string | null> {
    try {
      console.log('🔥 Testing snippet creation...');
      
      const testSnippet = {
        title: 'Firebase Test Snippet',
        description: 'A test snippet to verify Firebase write operations are working',
        code: `
// Test HTML
<div class="test">
  <h1>Firebase Test</h1>
  <p>This snippet was created by the Firebase debug utility.</p>
</div>

/* Test CSS */
.test {
  padding: 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 10px;
  color: white;
  text-align: center;
}

.test h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

// Test JavaScript
console.log('Firebase test snippet loaded successfully!');
        `,
        language: 'css',
        category: {
          id: 'css',
          label: 'CSS',
          mainCategory: {
            id: 'visual',
            name: 'Visual & Animation',
            color: 'text-pink-500'
          }
        },
        tags: ['test', 'firebase', 'debug'],
        authorId: 'debug-user',
        authorName: 'Debug Utility',
        isPublic: true
      };

      const snippetId = await FirebaseDbService.createSnippet(testSnippet);
      console.log('✅ Test snippet created successfully! ID:', snippetId);
      
      return snippetId;
    } catch (error) {
      console.error('❌ Test snippet creation failed:', error);
      return null;
    }
  }

  /**
   * Test reading snippets from Firestore
   */
  static async testReadSnippets(): Promise<number> {
    try {
      console.log('🔥 Testing snippet reading...');
      
      const snippets = await FirebaseDbService.getSnippets({ limitCount: 10 });
      console.log(`✅ Successfully read ${snippets.length} snippets from Firestore`);
      
      // Log first snippet for verification
      if (snippets.length > 0) {
        console.log('📄 Sample snippet:', snippets[0]);
      }
      
      return snippets.length;
    } catch (error) {
      console.error('❌ Reading snippets failed:', error);
      return 0;
    }
  }

  /**
   * Run a comprehensive Firebase test suite
   */
  static async runFullTest(): Promise<void> {
    console.log('🚀 Starting comprehensive Firebase test suite...');
    console.log('================================================');
    
    // Test 1: Basic connection
    const connectionWorking = await this.testConnection();
    
    // Test 2: Read existing snippets
    const snippetCount = await this.testReadSnippets();
    
    // Test 3: Create new snippet (only if connection is working)
    let createdSnippetId: string | null = null;
    if (connectionWorking) {
      createdSnippetId = await this.testCreateSnippet();
    }
    
    // Test 4: Read snippets again to verify the new one was added
    if (createdSnippetId) {
      const newSnippetCount = await this.testReadSnippets();
      if (newSnippetCount > snippetCount) {
        console.log('✅ New snippet successfully added and can be retrieved!');
      }
    }
    
    console.log('================================================');
    console.log('🏁 Firebase test suite completed!');
    console.log(`Connection: ${connectionWorking ? '✅' : '❌'}`);
    console.log(`Initial snippets found: ${snippetCount}`);
    console.log(`Test snippet created: ${createdSnippetId ? '✅' : '❌'}`);
  }

  /**
   * Seed the database with sample snippets for testing
   */
  static async seedSampleData(): Promise<void> {
    try {
      console.log('🌱 Seeding sample data...');
      
      const { DataSeeder } = await import('../services/DataSeeder');
      const results = await DataSeeder.seedDatabase();
      
      console.log(`✅ Successfully seeded ${results.length} sample snippets!`);
    } catch (error) {
      console.error('❌ Sample data seeding failed:', error);
    }
  }
}

// Make it available globally for easy testing in browser console
(window as any).FirebaseDebug = FirebaseDebug;
