import { List, Task } from '../models/index.js';

export const listService = {
  async getListsByBoard(boardId) {
    return await List.findAll({
      where: { boardId: parseInt(boardId, 10) },
      order: [['posicion', 'ASC']]
    });
  },

  async createList(boardId, data) {
    if (!data.nombre || !data.nombre.trim()) {
      const error = new Error('El nombre de la columna es obligatorio');
      error.status = 400;
      throw error;
    }

    const maxPosList = await List.findOne({
      where: { boardId: parseInt(boardId, 10) },
      order: [['posicion', 'DESC']]
    });
    const posicion = maxPosList ? maxPosList.posicion + 1 : 0;

    return await List.create({
      boardId: parseInt(boardId, 10),
      nombre: data.nombre.trim(),
      color: data.color || '#94a3b8',
      posicion: data.posicion !== undefined ? data.posicion : posicion
    });
  },

  async updateList(id, updates) {
    const list = await List.findByPk(id);
    if (!list) {
      const error = new Error(`Columna #${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    if (updates.nombre !== undefined) list.nombre = updates.nombre.trim();
    if (updates.color !== undefined) list.color = updates.color;
    if (updates.posicion !== undefined) list.posicion = parseInt(updates.posicion, 10);

    await list.save();
    return list;
  },

  async deleteList(id, { moveTasksToListId } = {}) {
    const list = await List.findByPk(id);
    if (!list) {
      const error = new Error(`Columna #${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    // Proteger tareas: si hay tareas, moverlas a otra columna o desvincularlas
    if (moveTasksToListId) {
      await Task.update({ listId: moveTasksToListId }, { where: { listId: list.id } });
    } else {
      // Buscar primera lista hermana en el mismo tablero
      const siblingList = await List.findOne({
        where: { boardId: list.boardId, id: { [Op.ne]: list.id } },
        order: [['posicion', 'ASC']]
      });
      if (siblingList) {
        await Task.update({ listId: siblingList.id }, { where: { listId: list.id } });
      } else {
        await Task.update({ listId: null }, { where: { listId: list.id } });
      }
    }

    const json = list.toJSON();
    await list.destroy();
    return json;
  },

  async reorderLists(boardId, orderedIds) {
    if (!Array.isArray(orderedIds)) {
      const error = new Error('Se requiere un arreglo de IDs ordenados');
      error.status = 400;
      throw error;
    }

    const promises = orderedIds.map((id, index) =>
      List.update({ posicion: index }, { where: { id, boardId: parseInt(boardId, 10) } })
    );

    await Promise.all(promises);
    return await this.getListsByBoard(boardId);
  }
};

export default listService;

