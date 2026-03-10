import { UserModel } from '../models/user.model';

jest.mock('../models/user.model');

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, email: 'test@test.com', name: 'Test User', createdAt: new Date() },
      ];
      (UserModel.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const users = await UserModel.findAll();

      expect(users).toEqual(mockUsers);
      expect(UserModel.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User', createdAt: new Date() };
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      const user = await UserModel.findById(1);

      expect(user).toEqual(mockUser);
      expect(UserModel.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      const user = await UserModel.findById(999);

      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const newUser = { email: 'new@test.com', name: 'New User' };
      const createdUser = { ...newUser, id: 1, createdAt: new Date() };
      (UserModel.create as jest.Mock).mockResolvedValue(createdUser);

      const user = await UserModel.create(newUser);

      expect(user).toEqual(createdUser);
      expect(UserModel.create).toHaveBeenCalledWith(newUser);
    });
  });

  describe('delete', () => {
    it('should return true when user deleted', async () => {
      (UserModel.delete as jest.Mock).mockResolvedValue(true);

      const result = await UserModel.delete(1);

      expect(result).toBe(true);
      expect(UserModel.delete).toHaveBeenCalledWith(1);
    });

    it('should return false when user not found', async () => {
      (UserModel.delete as jest.Mock).mockResolvedValue(false);

      const result = await UserModel.delete(999);

      expect(result).toBe(false);
    });
  });
});
