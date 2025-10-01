// Mock HubSpot integration client
export interface HubSpotClient {
  createBlogDraft: (data: BlogDraftData) => Promise<BlogDraftResponse>
  createEmailDraft: (data: EmailDraftData) => Promise<EmailDraftResponse>
  createList: (data: ListData) => Promise<ListResponse>
  createContact: (data: ContactData) => Promise<ContactResponse>
  updateContact: (id: string, data: Partial<ContactData>) => Promise<ContactResponse>
  getContact: (id: string) => Promise<ContactResponse>
}

export interface BlogDraftData {
  title: string
  content: string
  metaDescription?: string
  tags?: string[]
  authorId?: string
}

export interface BlogDraftResponse {
  id: string
  url: string
  status: 'draft' | 'published'
  createdAt: string
}

export interface EmailDraftData {
  name: string
  subject: string
  content: string
  fromEmail: string
  fromName: string
  listId?: string
}

export interface EmailDraftResponse {
  id: string
  url: string
  status: 'draft' | 'scheduled' | 'sent'
  createdAt: string
}

export interface ListData {
  name: string
  description?: string
  filters?: any[]
}

export interface ListResponse {
  id: string
  name: string
  memberCount: number
  createdAt: string
}

export interface ContactData {
  email: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  properties?: Record<string, any>
}

export interface ContactResponse {
  id: string
  email: string
  properties: Record<string, any>
  createdAt: string
  updatedAt: string
}

class MockHubSpotClient implements HubSpotClient {
  private isDevelopment = process.env.NODE_ENV === 'development'

  async createBlogDraft(data: BlogDraftData): Promise<BlogDraftResponse> {
    if (!this.isDevelopment) {
      throw new Error('HubSpot integration not configured. Set NODE_ENV=development for mock mode.')
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      id: `blog_${Date.now()}`,
      url: `https://app.hubspot.com/blogs/${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString()
    }
  }

  async createEmailDraft(data: EmailDraftData): Promise<EmailDraftResponse> {
    if (!this.isDevelopment) {
      throw new Error('HubSpot integration not configured. Set NODE_ENV=development for mock mode.')
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    return {
      id: `email_${Date.now()}`,
      url: `https://app.hubspot.com/email/${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString()
    }
  }

  async createList(data: ListData): Promise<ListResponse> {
    if (!this.isDevelopment) {
      throw new Error('HubSpot integration not configured. Set NODE_ENV=development for mock mode.')
    }

    await new Promise(resolve => setTimeout(resolve, 600))

    return {
      id: `list_${Date.now()}`,
      name: data.name,
      memberCount: Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString()
    }
  }

  async createContact(data: ContactData): Promise<ContactResponse> {
    if (!this.isDevelopment) {
      throw new Error('HubSpot integration not configured. Set NODE_ENV=development for mock mode.')
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      id: `contact_${Date.now()}`,
      email: data.email,
      properties: {
        firstname: data.firstName || '',
        lastname: data.lastName || '',
        company: data.company || '',
        phone: data.phone || '',
        ...data.properties
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  async updateContact(id: string, data: Partial<ContactData>): Promise<ContactResponse> {
    if (!this.isDevelopment) {
      throw new Error('HubSpot integration not configured. Set NODE_ENV=development for mock mode.')
    }

    await new Promise(resolve => setTimeout(resolve, 400))

    return {
      id,
      email: data.email || 'test@example.com',
      properties: {
        firstname: data.firstName || 'John',
        lastname: data.lastName || 'Doe',
        company: data.company || 'Example Corp',
        phone: data.phone || '+1234567890',
        ...data.properties
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString()
    }
  }

  async getContact(id: string): Promise<ContactResponse> {
    if (!this.isDevelopment) {
      throw new Error('HubSpot integration not configured. Set NODE_ENV=development for mock mode.')
    }

    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      id,
      email: 'test@example.com',
      properties: {
        firstname: 'John',
        lastname: 'Doe',
        company: 'Example Corp',
        phone: '+1234567890'
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}

// Real HubSpot client would be implemented here
class RealHubSpotClient implements HubSpotClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async createBlogDraft(data: BlogDraftData): Promise<BlogDraftResponse> {
    // Implementation would use HubSpot API
    throw new Error('Real HubSpot client not implemented')
  }

  async createEmailDraft(data: EmailDraftData): Promise<EmailDraftResponse> {
    throw new Error('Real HubSpot client not implemented')
  }

  async createList(data: ListData): Promise<ListResponse> {
    throw new Error('Real HubSpot client not implemented')
  }

  async createContact(data: ContactData): Promise<ContactResponse> {
    throw new Error('Real HubSpot client not implemented')
  }

  async updateContact(id: string, data: Partial<ContactData>): Promise<ContactResponse> {
    throw new Error('Real HubSpot client not implemented')
  }

  async getContact(id: string): Promise<ContactResponse> {
    throw new Error('Real HubSpot client not implemented')
  }
}

export function createHubSpotClient(): HubSpotClient {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN

  if (isDevelopment || !accessToken) {
    return new MockHubSpotClient()
  }

  return new RealHubSpotClient(accessToken)
}
