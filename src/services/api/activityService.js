import { getApperClient } from "@/services/apperClient";

class ActivityService {
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

      const response = await client.fetchRecords('activity_c', {
        fields: [
          { field: { Name: 'description_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'type_c' } },
          { field: { Name: 'contactId_c' } },
          { field: { Name: 'dealId_c' } }
        ],
        orderBy: [{ fieldName: 'timestamp_c', sorttype: 'DESC' }],
        pagingInfo: { limit: 1000, offset: 0 }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch activities');
      }

      return response.data || [];
    } catch (error) {
      console.error('ActivityService.getAll error:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.getRecordById('activity_c', parseInt(id), {
        fields: [
          { field: { Name: 'description_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'type_c' } },
          { field: { Name: 'contactId_c' } },
          { field: { Name: 'dealId_c' } }
        ]
      });

      if (!response.success || !response.data) {
        throw new Error(`Activity with Id ${id} not found`);
      }

      return response.data;
    } catch (error) {
      console.error('ActivityService.getById error:', error);
      throw error;
    }
  }

  async getByContactId(contactId) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.fetchRecords('activity_c', {
        fields: [
          { field: { Name: 'description_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'type_c' } },
          { field: { Name: 'contactId_c' } },
          { field: { Name: 'dealId_c' } }
        ],
        where: [{
          FieldName: 'contactId_c',
          Operator: 'EqualTo',
          Values: [parseInt(contactId)]
        }],
        orderBy: [{ fieldName: 'timestamp_c', sorttype: 'DESC' }],
        pagingInfo: { limit: 1000, offset: 0 }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch activities');
      }

      return response.data || [];
    } catch (error) {
      console.error('ActivityService.getByContactId error:', error);
      throw error;
    }
  }

  async getByDealId(dealId) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.fetchRecords('activity_c', {
        fields: [
          { field: { Name: 'description_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'type_c' } },
          { field: { Name: 'contactId_c' } },
          { field: { Name: 'dealId_c' } }
        ],
        where: [{
          FieldName: 'dealId_c',
          Operator: 'EqualTo',
          Values: [parseInt(dealId)]
        }],
        orderBy: [{ fieldName: 'timestamp_c', sorttype: 'DESC' }],
        pagingInfo: { limit: 1000, offset: 0 }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch activities');
      }

      return response.data || [];
    } catch (error) {
      console.error('ActivityService.getByDealId error:', error);
      throw error;
    }
  }
async create(activityData) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const recordData = {
        description_c: activityData.description_c || activityData.description,
        timestamp_c: activityData.timestamp_c || activityData.timestamp,
        type_c: activityData.type_c || activityData.type,
        contactId_c: activityData.contactId_c || activityData.contactId,
        dealId_c: activityData.dealId_c || activityData.dealId
      };

      const response = await client.createRecord('activity_c', {
        records: [recordData]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create activity');
      }

      if (response.results?.[0]?.success) {
        return response.results[0].data;
      }

      throw new Error(response.results?.[0]?.message || 'Failed to create activity');
    } catch (error) {
      console.error('ActivityService.create error:', error);
      throw error;
    }
  }

  async update(id, activityData) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const recordData = {
        Id: parseInt(id)
      };

      if (activityData.description_c !== undefined) recordData.description_c = activityData.description_c;
      if (activityData.description !== undefined) recordData.description_c = activityData.description;
      if (activityData.timestamp_c !== undefined) recordData.timestamp_c = activityData.timestamp_c;
      if (activityData.timestamp !== undefined) recordData.timestamp_c = activityData.timestamp;
      if (activityData.type_c !== undefined) recordData.type_c = activityData.type_c;
      if (activityData.type !== undefined) recordData.type_c = activityData.type;
      if (activityData.contactId_c !== undefined) recordData.contactId_c = activityData.contactId_c;
      if (activityData.contactId !== undefined) recordData.contactId_c = activityData.contactId;
      if (activityData.dealId_c !== undefined) recordData.dealId_c = activityData.dealId_c;
      if (activityData.dealId !== undefined) recordData.dealId_c = activityData.dealId;

      const response = await client.updateRecord('activity_c', {
        records: [recordData]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update activity');
      }

      if (response.results?.[0]?.success) {
        return response.results[0].data;
      }

      throw new Error(response.results?.[0]?.message || 'Failed to update activity');
    } catch (error) {
      console.error('ActivityService.update error:', error);
      throw error;
    }
  }

async delete(id) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.deleteRecord('activity_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete activity');
      }

      return { success: true };
    } catch (error) {
      console.error('ActivityService.delete error:', error);
      throw error;
    }
  }
}

export const activityService = new ActivityService();