import { getApperClient } from "@/services/apperClient";

class DealService {
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

      const response = await client.fetchRecords('deal_c', {
        fields: [
          { field: { Name: 'title_c' } },
          { field: { Name: 'value_c' } },
          { field: { Name: 'stage_c' } },
          { field: { Name: 'probability_c' } },
          { field: { Name: 'expectedCloseDate_c' } },
          { field: { Name: 'contactId_c' } }
        ],
        pagingInfo: { limit: 1000, offset: 0 }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch deals');
      }

      return response.data || [];
    } catch (error) {
      console.error('DealService.getAll error:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.getRecordById('deal_c', parseInt(id), {
        fields: [
          { field: { Name: 'title_c' } },
          { field: { Name: 'value_c' } },
          { field: { Name: 'stage_c' } },
          { field: { Name: 'probability_c' } },
          { field: { Name: 'expectedCloseDate_c' } },
          { field: { Name: 'contactId_c' } }
        ]
      });

      if (!response.success || !response.data) {
        throw new Error(`Deal with Id ${id} not found`);
      }

      return response.data;
    } catch (error) {
      console.error('DealService.getById error:', error);
      throw error;
    }
  }

async create(dealData) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const recordData = {
        title_c: dealData.title_c || dealData.title,
        value_c: dealData.value_c !== undefined ? dealData.value_c : dealData.value,
        stage_c: dealData.stage_c || dealData.stage || 'Lead',
        probability_c: dealData.probability_c !== undefined ? dealData.probability_c : dealData.probability,
        expectedCloseDate_c: dealData.expectedCloseDate_c || dealData.expectedCloseDate,
        contactId_c: dealData.contactId_c || dealData.contactId
      };

      const response = await client.createRecord('deal_c', {
        records: [recordData]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create deal');
      }

      if (response.results?.[0]?.success) {
        return response.results[0].data;
      }

      throw new Error(response.results?.[0]?.message || 'Failed to create deal');
    } catch (error) {
      console.error('DealService.create error:', error);
      throw error;
    }
  }

  async update(id, dealData) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const recordData = {
        Id: parseInt(id)
      };

      if (dealData.title_c !== undefined) recordData.title_c = dealData.title_c;
      if (dealData.title !== undefined) recordData.title_c = dealData.title;
      if (dealData.value_c !== undefined) recordData.value_c = dealData.value_c;
      if (dealData.value !== undefined) recordData.value_c = dealData.value;
      if (dealData.stage_c !== undefined) recordData.stage_c = dealData.stage_c;
      if (dealData.stage !== undefined) recordData.stage_c = dealData.stage;
      if (dealData.probability_c !== undefined) recordData.probability_c = dealData.probability_c;
      if (dealData.probability !== undefined) recordData.probability_c = dealData.probability;
      if (dealData.expectedCloseDate_c !== undefined) recordData.expectedCloseDate_c = dealData.expectedCloseDate_c;
      if (dealData.expectedCloseDate !== undefined) recordData.expectedCloseDate_c = dealData.expectedCloseDate;
      if (dealData.contactId_c !== undefined) recordData.contactId_c = dealData.contactId_c;
      if (dealData.contactId !== undefined) recordData.contactId_c = dealData.contactId;

      const response = await client.updateRecord('deal_c', {
        records: [recordData]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update deal');
      }

      if (response.results?.[0]?.success) {
        return response.results[0].data;
      }

      throw new Error(response.results?.[0]?.message || 'Failed to update deal');
    } catch (error) {
      console.error('DealService.update error:', error);
      throw error;
}

  async delete(id) {

async delete(id) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.deleteRecord('deal_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete deal');
      }

      return { success: true };
    } catch (error) {
      console.error('DealService.delete error:', error);
      throw error;
    }
  }
}

export const dealService = new DealService();