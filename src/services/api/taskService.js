import { getApperClient } from "@/services/apperClient";

class TaskService {
  constructor() {
    this.apperClient = null;
  }

  getClient() {
    if (!this.apperClient) {
      this.apperClient = getApperClient();
    }
    return this.apperClient;
  }

async getAll() {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.fetchRecords('task_c', {
        fields: [
          { field: { Name: 'title_c' } },
          { field: { Name: 'dueDate_c' } },
          { field: { Name: 'completed_c' } },
          { field: { Name: 'contactId_c' } }
        ],
        pagingInfo: { limit: 1000, offset: 0 }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tasks');
      }

      return response.data || [];
    } catch (error) {
      console.error('TaskService.getAll error:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.getRecordById('task_c', parseInt(id), {
        fields: [
          { field: { Name: 'title_c' } },
          { field: { Name: 'dueDate_c' } },
          { field: { Name: 'completed_c' } },
          { field: { Name: 'contactId_c' } }
        ]
      });

      if (!response.success || !response.data) {
        throw new Error(`Task with Id ${id} not found`);
      }

      return response.data;
    } catch (error) {
      console.error('TaskService.getById error:', error);
      throw error;
    }
  }

  async getByContactId(contactId) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.fetchRecords('task_c', {
        fields: [
          { field: { Name: 'title_c' } },
          { field: { Name: 'dueDate_c' } },
          { field: { Name: 'completed_c' } },
          { field: { Name: 'contactId_c' } }
        ],
        where: [{
          FieldName: 'contactId_c',
          Operator: 'EqualTo',
          Values: [parseInt(contactId)]
        }],
        pagingInfo: { limit: 1000, offset: 0 }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tasks');
      }

      return response.data || [];
    } catch (error) {
      console.error('TaskService.getByContactId error:', error);
      throw error;
    }
  }
async create(taskData) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const recordData = {
        title_c: taskData.title_c || taskData.title,
        dueDate_c: taskData.dueDate_c || taskData.dueDate,
        completed_c: taskData.completed_c !== undefined ? taskData.completed_c : (taskData.completed || false),
        contactId_c: taskData.contactId_c || taskData.contactId
      };

      const response = await client.createRecord('task_c', {
        records: [recordData]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create task');
      }

      if (response.results?.[0]?.success) {
        return response.results[0].data;
      }

      throw new Error(response.results?.[0]?.message || 'Failed to create task');
    } catch (error) {
      console.error('TaskService.create error:', error);
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const recordData = {
        Id: parseInt(id)
      };

      if (taskData.title_c !== undefined) recordData.title_c = taskData.title_c;
      if (taskData.title !== undefined) recordData.title_c = taskData.title;
      if (taskData.dueDate_c !== undefined) recordData.dueDate_c = taskData.dueDate_c;
      if (taskData.dueDate !== undefined) recordData.dueDate_c = taskData.dueDate;
      if (taskData.completed_c !== undefined) recordData.completed_c = taskData.completed_c;
      if (taskData.completed !== undefined) recordData.completed_c = taskData.completed;
      if (taskData.contactId_c !== undefined) recordData.contactId_c = taskData.contactId_c;
      if (taskData.contactId !== undefined) recordData.contactId_c = taskData.contactId;

      const response = await client.updateRecord('task_c', {
        records: [recordData]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update task');
      }

      if (response.results?.[0]?.success) {
        return response.results[0].data;
      }

      throw new Error(response.results?.[0]?.message || 'Failed to update task');
    } catch (error) {
      console.error('TaskService.update error:', error);
      throw error;
    }
  }

async delete(id) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.deleteRecord('task_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete task');
      }

      return { success: true };
    } catch (error) {
      console.error('TaskService.delete error:', error);
      throw error;
    }
  }
}

export const taskService = new TaskService();