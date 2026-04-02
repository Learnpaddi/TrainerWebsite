import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export class CreateCourseDto {
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  duration: number; // hours
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  thumbnail?: string;
  tags?: string[];
  tenantId?: string;
}

@Injectable()
export class CoursesService {
  constructor(private firebase: FirebaseService) {}

  async create(createCourseDto: CreateCourseDto, tenantId?: string) {
    const courseData = {
      ...createCourseDto,
      modules: [],
    };
    const ref = await this.firebase.addDocument('courses', courseData, tenantId);
    return ref;
  }

  async findAll(tenantId?: string) {
    return await this.firebase.getDocuments('courses', tenantId);
  }

  async findOne(id: string, tenantId?: string) {
    const docSnap = await this.firebase.firestore.collection('courses').doc(id).get();
    if (!docSnap.exists) return null;
    const data = docSnap.data();
    if (tenantId && data.tenantId !== tenantId) return null;
    return { id: docSnap.id, ...data };
  }
}

