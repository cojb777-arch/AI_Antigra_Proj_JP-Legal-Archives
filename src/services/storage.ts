/* =========================================================
   📦 STORAGE SERVICE (ローカルストレージ＆約定・過去問DB管理)
   ========================================================= */

import { ExamQuestion } from '../data/exam-questions';

const STORAGE_KEYS = {
  GEMINI_API_KEY: 'legal_archives_gemini_api_key',
  GEMINI_MODEL: 'legal_archives_gemini_model',
  BOOKMARKS: 'legal_archives_bookmarks',
  SAVED_CONTRACTS: 'legal_archives_saved_contracts',
  CONTRACT_ARCHIVES: 'legal_archives_contract_db',
  CUSTOM_EXAMS: 'legal_archives_custom_exams', // ユーザーがアップロードした過去問DB
  ACTIVE_ROOM: 'legal_archives_active_room',
};

export interface Bookmark {
  id: string;
  lawId: string;
  lawTitle: string;
  articleNum: string;
  articleText: string;
  timestamp: number;
}

export interface ContractArchiveItem {
  id: string;
  title: string;
  fileName?: string;
  uploadedAt: number;
  contractType: string;
  summary: string;
  riskLevel: '低' | '中' | '高';
  keyClauses: { title: string; body: string; riskNote?: string }[];
  complianceLaws: string[];
  fullAnalysisText: string;
  rawText?: string;
}

export const StorageService = {
  getGeminiApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
  },

  setGeminiApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
  },

  getGeminiModel(): string {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_MODEL) || 'gemini-2.5-flash';
  },

  setGeminiModel(model: string): void {
    localStorage.setItem(STORAGE_KEYS.GEMINI_MODEL, model);
  },

  getActiveRoom(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROOM) || 'librarian';
  },

  setActiveRoom(room: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROOM, room);
  },

  getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addBookmark(bookmark: Omit<Bookmark, 'id' | 'timestamp'>): void {
    const list = this.getBookmarks();
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `${bookmark.lawId}_${bookmark.articleNum}_${Date.now()}`,
      timestamp: Date.now()
    };
    list.unshift(newBookmark);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
  },

  removeBookmark(id: string): void {
    const list = this.getBookmarks().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
  },

  /* =========================================================
     📜 約定解析室：契約書アーカイブDB
     ========================================================= */
  getContractArchives(): ContractArchiveItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTRACT_ARCHIVES);
      if (data) return JSON.parse(data);
    } catch {
      // 読み込み失敗時は初期サンプルを返す
    }
    const initialSample: ContractArchiveItem = {
      id: 'sample-nda-01',
      title: '秘密保持契約書（業務提携検討用・標準ひな形）',
      fileName: 'nda_sample_2026.pdf',
      uploadedAt: Date.now() - 86400000 * 3,
      contractType: '秘密保持契約（NDA）',
      summary: '業務提携の検討に伴い相互に開示される秘密情報の取扱い、目的外使用の禁止、損害賠償義務および差止請求権を定めた標準的な契約書。',
      riskLevel: '低',
      keyClauses: [
        { title: '第1条（定義）', body: '開示された技術上・営業上の一切の情報を秘密情報と定義。' },
        { title: '第3条（目的外使用禁止）', body: '本目的以外での使用、および第三者への開示・漏洩を厳格に禁止。' },
        { title: '第6条（有効期間）', body: '開示後3年間有効。' }
      ],
      complianceLaws: ['不正競争防止法', '民法第415条', '個人情報保護法'],
      fullAnalysisText: '### 契約書解析総括\n本契約書は一般的な秘密保持契約書としてバランスが取れており、重大な不利条項は見受けられません。\n- **準拠法・管轄**: 東京地方裁判所\n- **特記事項**: 秘密情報の返還・破棄条項が明確に規定されています。'
    };
    return [initialSample];
  },

  addContractArchive(item: Omit<ContractArchiveItem, 'id' | 'uploadedAt'>): ContractArchiveItem {
    const list = this.getContractArchives();
    const newItem: ContractArchiveItem = {
      ...item,
      id: 'contract_' + Date.now(),
      uploadedAt: Date.now()
    };
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.CONTRACT_ARCHIVES, JSON.stringify(list));
    return newItem;
  },

  removeContractArchive(id: string): void {
    const list = this.getContractArchives().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTRACT_ARCHIVES, JSON.stringify(list));
  },

  /* =========================================================
     🎓 試問室：アップロード自作過去問DB
     ========================================================= */
  getCustomExamQuestions(): ExamQuestion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXAMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addCustomExamQuestions(questions: ExamQuestion[]): void {
    const list = this.getCustomExamQuestions();
    // 重複防止
    const existingIds = new Set(list.map(q => q.id));
    questions.forEach(q => {
      if (!existingIds.has(q.id)) {
        list.unshift(q);
      }
    });
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXAMS, JSON.stringify(list));
  },

  removeCustomExamQuestion(id: string): void {
    const list = this.getCustomExamQuestions().filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXAMS, JSON.stringify(list));
  }
};
