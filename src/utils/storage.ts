import type { CRMDatabase } from '../types/crm';
import { INITIAL_DATABASE } from '../data/initialData';
import { encodeData, decodeData } from './crypto';

const STORAGE_KEY = 'bridgeye_crm_db_v1';

export class StorageEngine {
  public static getDatabase(): CRMDatabase {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.saveDatabase(INITIAL_DATABASE);
        return INITIAL_DATABASE;
      }
      const parsed = decodeData<CRMDatabase>(stored);
      if (!parsed || !parsed.users || !parsed.contacts || !parsed.deals) {
        this.saveDatabase(INITIAL_DATABASE);
        return INITIAL_DATABASE;
      }
      return parsed;
    } catch (e) {
      console.error('Storage read error, using initial database:', e);
      return INITIAL_DATABASE;
    }
  }

  public static saveDatabase(data: CRMDatabase): void {
    try {
      const encoded = encodeData(data);
      localStorage.setItem(STORAGE_KEY, encoded);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public static resetToDefault(): CRMDatabase {
    this.saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }

  public static clearAllData(): CRMDatabase {
    const emptyDb: CRMDatabase = {
      ...INITIAL_DATABASE,
      contacts: [],
      companies: [],
      deals: [],
      activities: [],
      tasks: [],
      communicationLogs: [],
    };
    this.saveDatabase(emptyDb);
    return emptyDb;
  }
}
