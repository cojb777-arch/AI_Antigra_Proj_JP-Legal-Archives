/* =========================================================
   🏛️ JAPAN LEGAL ARCHIVES - MAIN APPLICATION ENTRY
   日本帝国法令図書館 アプリケーションエントリー
   ========================================================= */

import { StorageService, ContractArchiveItem } from './services/storage';
import { SpeechService } from './services/speech';
import { LibrarianRoom } from './rooms/LibrarianRoom';
import { KnowledgeMapRoom } from './rooms/KnowledgeMapRoom';
import { ChronicleRoom } from './rooms/ChronicleRoom';
import { SituationalRoom } from './rooms/SituationalRoom';
import { AnalyzeRoom } from './rooms/AnalyzeRoom';
import { ScribeRoom } from './rooms/ScribeRoom';
import { ExamRoom } from './rooms/ExamRoom';

class LegalArchivesApp {
  private librarianRoom: LibrarianRoom;
  private knowledgeMapRoom: KnowledgeMapRoom;
  private chronicleRoom: ChronicleRoom;
  private situationalRoom: SituationalRoom;
  private analyzeRoom: AnalyzeRoom;
  private scribeRoom: ScribeRoom;
  private examRoom: ExamRoom;

  constructor() {
    // 画面間ジャンプ用の共通ハンドラー（条文ジャンプ）
    const navigateToLaw = (lawId: string, articleNum?: string) => {
      this.switchRoom('map');
      this.knowledgeMapRoom.loadLaw(lawId, articleNum);
    };

    // 約定解析室から約定作成室へのテンプレート転送ハンドラー
    const draftWithTemplate = (archiveItem: ContractArchiveItem) => {
      this.switchRoom('scribe');
      this.scribeRoom.loadWithArchiveItem(archiveItem);
    };

    // 1. 相談室
    this.librarianRoom = new LibrarianRoom('room-librarian', navigateToLaw);
    // 2. 地図・目録室
    this.knowledgeMapRoom = new KnowledgeMapRoom('room-map');
    // 3. 年代記室
    this.chronicleRoom = new ChronicleRoom('room-chronicle');
    // 4. 実務相談窓口
    this.situationalRoom = new SituationalRoom('room-situational');
    // 5. 約定解析室 (新設)
    this.analyzeRoom = new AnalyzeRoom('room-analyze', draftWithTemplate);
    // 6. 約定作成室 (旧写字室)
    this.scribeRoom = new ScribeRoom('room-scribe');
    // 7. 試問・素読室 (一番右端)
    this.examRoom = new ExamRoom('room-exam', navigateToLaw);
  }

  public init(): void {
    this.startClock();
    this.setupSettingsModal();
    this.setupNavigation();
    this.setupGlobalSpeechControls();

    // 全部屋のレンダリング
    this.librarianRoom.render();
    this.knowledgeMapRoom.render();
    this.chronicleRoom.render();
    this.situationalRoom.render();
    this.analyzeRoom.render();
    this.scribeRoom.render();
    this.examRoom.render();

    // 初回アクティブルームの設定
    const savedRoom = StorageService.getActiveRoom();
    this.switchRoom(savedRoom);
  }

  /* =========================================================
     🕰️ 帝国図書館 時計
     ========================================================= */
  private startClock(): void {
    const clockEl = document.getElementById('clock-text');
    const update = () => {
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('ja-JP', { hour12: false });
      }
    };
    update();
    setInterval(update, 1000);
  }

  /* =========================================================
     ⚙️ 館内設定モーダル
     ========================================================= */
  private setupSettingsModal(): void {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('btn-open-settings');
    const closeBtn = document.getElementById('btn-close-settings');
    const saveBtn = document.getElementById('btn-save-settings');
    const keyInput = document.getElementById('input-gemini-key') as HTMLInputElement;
    const modelSelect = document.getElementById('select-gemini-model') as HTMLSelectElement;
    const toggleKeyBtn = document.getElementById('btn-toggle-key-visibility');

    const openModal = () => {
      if (keyInput) keyInput.value = StorageService.getGeminiApiKey();
      if (modelSelect) modelSelect.value = StorageService.getGeminiModel();
      modal?.classList.remove('hidden');
    };

    const closeModal = () => {
      modal?.classList.add('hidden');
    };

    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    saveBtn?.addEventListener('click', () => {
      if (keyInput) StorageService.setGeminiApiKey(keyInput.value);
      if (modelSelect) StorageService.setGeminiModel(modelSelect.value);
      alert('🏛️ 司書室の設定を保存いたしました。');
      closeModal();
    });

    toggleKeyBtn?.addEventListener('click', () => {
      if (keyInput) {
        const isPass = keyInput.type === 'password';
        keyInput.type = isPass ? 'text' : 'password';
        if (toggleKeyBtn) toggleKeyBtn.textContent = isPass ? '隠す' : '表示';
      }
    });
  }

  /* =========================================================
     📜 部屋切り替えナビゲーション
     ========================================================= */
  private setupNavigation(): void {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const roomName = tab.getAttribute('data-room');
        if (roomName) {
          this.switchRoom(roomName);
        }
      });
    });
  }

  public switchRoom(roomName: string): void {
    StorageService.setActiveRoom(roomName);

    // タブのactive更新
    document.querySelectorAll('.nav-tab').forEach(tab => {
      const match = tab.getAttribute('data-room') === roomName;
      tab.classList.toggle('active', match);
    });

    // 部屋コンテナのactive更新
    document.querySelectorAll('.archive-room').forEach(section => {
      const match = section.id === `room-${roomName}`;
      section.classList.toggle('active', match);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =========================================================
     🔊 音声読み上げグローバルバー
     ========================================================= */
  private setupGlobalSpeechControls(): void {
    const pauseBtn = document.getElementById('btn-speech-pause');
    const stopBtn = document.getElementById('btn-speech-stop');
    const speedSelect = document.getElementById('speech-rate-select') as HTMLSelectElement;

    pauseBtn?.addEventListener('click', () => SpeechService.pause());
    stopBtn?.addEventListener('click', () => SpeechService.stop());

    speedSelect?.addEventListener('change', () => {
      const rate = parseFloat(speedSelect.value);
      SpeechService.setRate(rate);
    });
  }
}

// アプリケーション起動
window.addEventListener('DOMContentLoaded', () => {
  const app = new LegalArchivesApp();
  app.init();
});
