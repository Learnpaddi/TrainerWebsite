import { useEffect, useState } from 'react';
import { auth, onAuthChange, getCourses, createCourse, updateCourse, deleteCourse, logout, isAdmin } from './lib/firebase';
import './App.css';

interface Course {
  id: string;
  title
