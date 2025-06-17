import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api'; // Замените на ваш URL

export interface Category {
  id: number;
  name: string;
  image_url?: string;
  thumbnail_url?: string;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};