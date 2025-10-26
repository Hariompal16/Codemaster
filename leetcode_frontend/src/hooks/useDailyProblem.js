import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

export const useDailyProblem = () => {
  const [dailyProblem, setDailyProblem] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDailyProblem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosClient.get('/problem/daily-problem');
      
      setDailyProblem(response.data);
    } catch (err) {
      console.error('Error fetching daily problem:', err);
      setError('Failed to fetch daily problem');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
     
      const response = await axiosClient.get('/problem/daily-streak');
      setStreak(response.data);
    } catch (err) {
      console.error('❌ Error fetching streak:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.error('Error message:', err.message);
      // Don't set error here as streak is optional
    }
  };

  const markProgress = async (problemId, status = 'solved') => {
    try {
       const res=await axiosClient.post('/problem/daily-progress', {
        problemId,
        status
      });
      
      // Refresh data after marking progress
      await Promise.all([fetchDailyProblem(), fetchStreak()]);
      
      return { success: true };
    } catch (err) {
      console.error('Error marking progress:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update progress' 
      };
    }
  };

  useEffect(() => {
    fetchDailyProblem();
    fetchStreak();
  }, []);

  return {
    dailyProblem,
    streak,
    loading,
    error,
    markProgress,
    refetch: () => {
      fetchDailyProblem();
      fetchStreak();
    }
  };
};
