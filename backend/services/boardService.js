import { Board, BoardMember, List, Task, User, TaskAssignment, Label, Checklist, ChecklistItem, Comment } from '../models/index.js';
import { Op } from 'sequelize';

export const boardService = {
  async getBoards(currentUser) {
    if (currentUser.rol === 'admin') {
      return await Board.findAll({
        include: [
          { model: User, as: 'owner', attributes: ['id', 'nombre', 'email', 'avatar'] },
          { model: User, as: 'members', attributes: ['id', 'nombre', 'email', 'avatar'], through: { attributes: ['rol'] } }
        ],
        order: [['id', 'ASC']]
      });
    }

    // Usuario estándar: tableros de los que es propietario o miembro
    return await Board.findAll({
      include: [
        { model: User, as: 'owner', attributes: ['id', 'nombre', 'email', 'avatar'] },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'nombre', 'email', 'avatar'],
          through: { attributes: ['rol'] },
          where: { id: currentUser.id },
          required: false
        }
      ],
      where: {
        [Op.or]: [
          { ownerId: currentUser.id },
          { '$members.id$': currentUser.id }
        ]
      },
      order: [['id', 'ASC']]
    });
  },

  async getBoardById(id, currentUser) {
    const board = await Board.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'nombre', 'email', 'avatar'] },
        { model: User, as: 'members', attributes: ['id', 'nombre', 'email', 'avatar'], through: { attributes: ['rol'] } },
        {
          model: List,
          as: 'lists',
          include: [
            {
              model: Task,
              as: 'tasks',
              where: { isArchived: false },
              required: false,
              include: [
                { model: User, as: 'creator', attributes: ['id', 'nombre', 'email', 'avatar'] },
                {
                  model: TaskAssignment,
                  as: 'assignments',
                  include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'email', 'avatar'] }]
                },
                { model: Label, as: 'labels', through: { attributes: [] } },
                {
                  model: Checklist,
                  as: 'checklists',
                  include: [{ model: ChecklistItem, as: 'items' }]
                },
                { model: Comment, as: 'comments', attributes: ['id'] }
              ]
            }
          ]
        }
      ],
      order: [
        [{ model: List, as: 'lists' }, 'posicion', 'ASC'],
        [{ model: List, as: 'lists' }, { model: Task, as: 'tasks' }, 'posicion', 'ASC']
      ]
    });

    if (!board) {
      const error = new Error(`Tablero #${id} no encontrado`);
      error.status = 404;
      throw error;
    }

    return board;
  },

  async createBoard(data, currentUser) {
    if (!data.nombre || !data.nombre.trim()) {
      const error = new Error('El nombre del tablero es obligatorio');
      error.status = 400;
      throw error;
    }

    const board = await Board.create({
      nombre: data.nombre.trim(),
      descripcion: data.descripcion ? data.descripcion.trim() : '',
      color: data.color || '#3b82f6',
      ownerId: currentUser.id
    });

    // Agregar al creador como miembro owner
    await BoardMember.create({
      boardId: board.id,
      userId: currentUser.id,
      rol: 'owner'
    });

    // Crear columnas Kanban estándar automáticamente
    const defaultLists = [
      { nombre: 'Por hacer', posicion: 0, color: '#94a3b8' },
      { nombre: 'En progreso', posicion: 1, color: '#f59e0b' },
      { nombre: 'En revisión', posicion: 2, color: '#8b5cf6' },
      { nombre: 'Completada', posicion: 3, color: '#10b981' }
    ];

    for (const l of defaultLists) {
      await List.create({
        boardId: board.id,
        nombre: l.nombre,
        posicion: l.posicion,
        color: l.color
      });
    }

    return await this.getBoardById(board.id, currentUser);
  },

  async updateBoard(id, updates, currentUser) {
    const board = await Board.findByPk(id);
    if (!board) {
      const error = new Error(`Tablero #${id} no encontrado`);
      error.status = 404;
      throw error;
    }

    if (updates.nombre !== undefined) board.nombre = updates.nombre.trim();
    if (updates.descripcion !== undefined) board.descripcion = updates.descripcion.trim();
    if (updates.color !== undefined) board.color = updates.color;

    await board.save();
    return await this.getBoardById(board.id, currentUser);
  },

  async deleteBoard(id, currentUser) {
    const board = await Board.findByPk(id);
    if (!board) {
      const error = new Error(`Tablero #${id} no encontrado`);
      error.status = 404;
      throw error;
    }

    const json = board.toJSON();
    await board.destroy();
    return json;
  },

  async addMember(boardId, { userId, rol = 'member' }) {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      throw error;
    }

    const [member, created] = await BoardMember.findOrCreate({
      where: { boardId, userId },
      defaults: { boardId, userId, rol }
    });

    if (!created) {
      member.rol = rol;
      await member.save();
    }

    return member;
  },

  async removeMember(boardId, userId) {
    const member = await BoardMember.findOne({ where: { boardId, userId } });
    if (!member) {
      const error = new Error('Membresía no encontrada');
      error.status = 404;
      throw error;
    }
    await member.destroy();
    return { message: 'Miembro removido exitosamente' };
  }
};

export default boardService;

