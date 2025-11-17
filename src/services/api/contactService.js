import { getApperClient } from "@/services/apperClient";

class ContactService {
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

      const response = await client.fetchRecords('contact_c', {
        fields: [
          { field: { Name: 'name_c' } },
          { field: { Name: 'company_c' } },
          { field: { Name: 'email_c' } },
          { field: { Name: 'phone_c' } },
          { field: { Name: 'tags_c' } },
          { field: { Name: 'notes_c' } }
        ],
        pagingInfo: { limit: 1000, offset: 0 }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch contacts');
      }

      return response.data || [];
    } catch (error) {
      console.error('ContactService.getAll error:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.getRecordById('contact_c', parseInt(id), {
        fields: [
          { field: { Name: 'name_c' } },
          { field: { Name: 'company_c' } },
          { field: { Name: 'email_c' } },
          { field: { Name: 'phone_c' } },
          { field: { Name: 'tags_c' } },
          { field: { Name: 'notes_c' } }
        ]
      });

      if (!response.success || !response.data) {
        throw new Error(`Contact with Id ${id} not found`);
      }

      return response.data;
    } catch (error) {
      console.error('ContactService.getById error:', error);
      throw error;
    }
  }

async create(contactData) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const recordData = {
        name_c: contactData.name_c || contactData.name,
        company_c: contactData.company_c || contactData.company,
        email_c: contactData.email_c || contactData.email,
        phone_c: contactData.phone_c || contactData.phone,
        tags_c: contactData.tags_c || contactData.tags,
        notes_c: contactData.notes_c || contactData.notes
      };

      const response = await client.createRecord('contact_c', {
        records: [recordData]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create contact');
      }

      if (response.results?.[0]?.success) {
        return response.results[0].data;
      }

      throw new Error(response.results?.[0]?.message || 'Failed to create contact');
    } catch (error) {
      console.error('ContactService.create error:', error);
      throw error;
    }
  }

  async update(id, contactData) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const recordData = {
        Id: parseInt(id)
      };

      if (contactData.name_c !== undefined) recordData.name_c = contactData.name_c;
      if (contactData.name !== undefined) recordData.name_c = contactData.name;
      if (contactData.company_c !== undefined) recordData.company_c = contactData.company_c;
      if (contactData.company !== undefined) recordData.company_c = contactData.company;
      if (contactData.email_c !== undefined) recordData.email_c = contactData.email_c;
      if (contactData.email !== undefined) recordData.email_c = contactData.email;
      if (contactData.phone_c !== undefined) recordData.phone_c = contactData.phone_c;
      if (contactData.phone !== undefined) recordData.phone_c = contactData.phone;
      if (contactData.tags_c !== undefined) recordData.tags_c = contactData.tags_c;
      if (contactData.tags !== undefined) recordData.tags_c = contactData.tags;
      if (contactData.notes_c !== undefined) recordData.notes_c = contactData.notes_c;
      if (contactData.notes !== undefined) recordData.notes_c = contactData.notes;

      const response = await client.updateRecord('contact_c', {
        records: [recordData]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update contact');
      }

      if (response.results?.[0]?.success) {
        return response.results[0].data;
      }

      throw new Error(response.results?.[0]?.message || 'Failed to update contact');
    } catch (error) {
      console.error('ContactService.update error:', error);
      throw error;
    }
  }

async delete(id) {
    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('ApperClient not initialized');
      }

      const response = await client.deleteRecord('contact_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete contact');
      }

      return { success: true };
    } catch (error) {
      console.error('ContactService.delete error:', error);
      throw error;
    }
  }
}

export const contactService = new ContactService();