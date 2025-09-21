import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import SearchBox from '../SearchBox/SearchBox';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import { fetchNotes, createNote, deleteNote } from '../../services/noteService';
import css from './App.module.css';
import type { FetchNotesResponse } from '../../services/noteService';

const PER_PAGE = 12;

const App: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [previousData, setPreviousData] = useState<FetchNotesResponse | undefined>();

  const queryClient = useQueryClient();

    useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
  queryKey: ['notes', { page, search: debouncedSearch }],
  queryFn: () => fetchNotes({ page, perPage: PER_PAGE, search: debouncedSearch }),
  staleTime: 1000 * 60 * 5,
  placeholderData: previousData,
});

useEffect(() => {
    if (data) {
      setPreviousData(data);
    }
  }, [data]);

const createNoteMutation = useMutation({
  mutationFn: createNote,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    setIsModalOpen(false);
  },
});



 const deleteNoteMutation = useMutation({
  mutationFn: deleteNote,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  },
});



  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={setSearch} />
        {data?.totalPages && data.totalPages > 1 && (
          <Pagination pageCount={data.totalPages} currentPage={page} onPageChange={setPage} />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading notes.</p>}

      {data?.notes?.length ? (
        <NoteList notes={data.notes} onDelete={handleDelete} />
      ) : (
        !isLoading && <p>No notes found.</p>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onSubmit={(values) => {
              createNoteMutation.mutate(values);
            }}
            onCancel={() => setIsModalOpen(false)}
            isPending={createNoteMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;
