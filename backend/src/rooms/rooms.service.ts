import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(@InjectRepository(Room) private roomRepo: Repository<Room>) {}

  async findAll(topic?: string, search?: string) {
    const where: any = { isActive: true };
    if (topic) where.topic = topic;
    if (search) where.name = ILike(`%${search}%`);
    return this.roomRepo.find({ where, order: { membersCount: 'DESC' } });
  }

  async findById(id: string): Promise<Room> {
    const room = await this.roomRepo.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async join(roomId: string) {
    await this.roomRepo.increment({ id: roomId }, 'membersCount', 1);
  }

  async leave(roomId: string) {
    await this.roomRepo.decrement({ id: roomId }, 'membersCount', 1);
  }

  async seed() {
    const defaultRooms = [
      { name: 'Anime & Manga', topic: 'anime', description: 'For fans of Japanese animation and comics' },
      { name: 'PC & Console Gaming', topic: 'gaming', description: 'Gamers unite' },
      { name: 'Indie Music Lovers', topic: 'music', description: 'Share your indie discoveries' },
      { name: 'World Travelers', topic: 'travel', description: 'Adventure seekers welcome' },
      { name: 'Book Club', topic: 'books', description: 'Reading recommendations & discussions' },
      { name: 'Fitness & Health', topic: 'fitness', description: 'Workout tips and motivation' },
      { name: 'Foodies', topic: 'food', description: 'Cooking, restaurants, recipes' },
      { name: 'Tech & Dev', topic: 'tech', description: 'For the tech-minded' },
      { name: 'Art & Creativity', topic: 'art', description: 'Artists, photographers, creators' },
      { name: 'Film & TV', topic: 'film', description: 'Movie buffs and binge watchers' },
    ];

    for (const room of defaultRooms) {
      const exists = await this.roomRepo.findOne({ where: { name: room.name } });
      if (!exists) await this.roomRepo.save(this.roomRepo.create(room));
    }
  }
}
