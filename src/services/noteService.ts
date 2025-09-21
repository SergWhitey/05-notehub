import axios from 'axios'
import type { AxiosResponse } from 'axios';
import type { Note } from '../types/note';

const token = import.meta.env.VITE_NOTEHUB_TOKEN;

if (!token) {
  throw new Error('VITE_NOTEHUB_TOKEN is not defined');
}

const axiosInstance = axios.create({
  baseURL: 'https://notehub-public.goit.study/api',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export const fetchNotes = async (
  params: FetchNotesParams = {}
): Promise<FetchNotesResponse> => {
  const response: AxiosResponse<FetchNotesResponse> = await axiosInstance.get('/notes', {
    params,
  });
  return response.data;
};

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: string;
}

export const createNote = async (
  data: CreateNoteParams
): Promise<Note> => {
  const response: AxiosResponse<Note> = await axiosInstance.post('/notes', data);
  return response.data;
};

export const deleteNote = async (
  id: string
): Promise<Note> => {
  const response: AxiosResponse<{ note: Note }> = await axiosInstance.delete(`/notes/${id}`);
  return response.data.note;
};