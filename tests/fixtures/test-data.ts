export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'ValidPassword123!',
    name: 'Test User'
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  }
};

export const testPlans = {
  samplePlan: {
    name: 'Weekend in Krakow',
    startDate: '2024-07-15',
    endDate: '2024-07-17',
    peopleCount: 2,
    notes: 'Looking for historical sites and good restaurants',
    places: ['Wawel Castle', 'Main Market Square', 'Kazimierz District']
  },
  longPlan: {
    name: 'Two weeks in Europe',
    startDate: '2024-08-01',
    endDate: '2024-08-14',
    peopleCount: 4,
    notes: 'Family trip covering multiple countries',
    places: ['Paris', 'Rome', 'Barcelona', 'Amsterdam']
  }
};

export const apiResponses = {
  authError: {
    message: 'Invalid credentials'
  },
  planCreated: {
    id: 'plan-123',
    status: 'created'
  },
  aiGenerationInProgress: {
    status: 'generating',
    progress: 50
  },
  aiGenerationComplete: {
    status: 'completed',
    result: {
      days: [
        {
          day: 1,
          activities: [
            {
              time: '09:00',
              activity: 'Visit Wawel Castle',
              description: 'Explore the royal castle and cathedral'
            }
          ]
        }
      ]
    }
  }
}; 