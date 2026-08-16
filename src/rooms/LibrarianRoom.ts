/* =========================================================
   📖 1. CONSULTATION ROOM (相談室: 旧 第一閲覧室)
   〜 AI司書対話 ＆ 条文即時引当 〜
   ========================================================= */

import { GeminiApiService } from '../services/gemini-api';
import { EgovApiService } from '../services/egov-api';
import { SpeechService } from '../services/speech';

export class LibrarianRoom {
  private container: HTMLElement;
  private chatHistoryEl: HTMLElement | null = null;
  private chatInputEl: HTMLTextAreaElement | null = null;
  private isProcessing = false;
  private conversationContext: string = "";
  private onNavigateToLaw?: (lawId: string, articleNum?: string) => void;

  constructor(containerId: string, onNavigateToLaw?: (lawId: string, articleNum?: string) => void) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.onNavigateToLaw = onNavigateToLaw;
  }

  public setNavigateHandler(handler: (lawId: string, articleNum?: string) => void): void {
    this.onNavigateToLaw = handler;
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="room-header">
        <div class="room-title-group">
          <span class="room-tag">THE CONSULTATION & INQUIRY CHAMBER</span>
          <h2 class="room-title">📖 相談室 <span style="font-size: 14px; font-weight: normal; color: var(--color-brass-dark);">〜 AI司書対話 ＆ 条文即時引当 〜</span></h2>
          <p class="room-desc">自然な日常語で法律の相談や疑問をお話しください。帝国法令司書が法的論点を解き明かし、e-Gov公式条文を引き当ててご案内いたします。</p>
        </div>
        <button id="btn-clear-chat" class="btn-outline-classic">
          <span>🧹</span> 相談履歴を清める
        </button>
      </div>

      <div class="librarian-layout">
        <!-- 左サイドバー -->
        <aside class="librarian-sidebar">
          <div class="librarian-avatar-card">
            <div class="librarian-portrait">🎩</div>
            <div class="librarian-name">主席法令司書 アーサー</div>
            <div class="librarian-title">Imperial Chief Legal Librarian</div>
            <p style="font-size: 12px; color: var(--text-sepia); margin-top: 8px;">
              「どのような法規・条文をお探しでございましょうか。些細な疑問でも遠慮なくお尋ねください。」
            </p>
          </div>

          <div class="quick-topics parchment-card">
            <span class="quick-topics-label">📜 よくあるご相談・論点（クリックで即相談）</span>
            <div class="topic-pills">
              <button class="topic-pill" data-prompt="ネット通販で買った商品を返品したいのですが、クーリングオフは適用されますか？関係条文を教えてください。">
                🛒 ネット通販の返品と特商法
              </button>
              <button class="topic-pill" data-prompt="残業代の計算方法と、36協定の上限時間について労働基準法の規定を教えてください。">
                💼 残業時間の上限と労基法36条
              </button>
              <button class="topic-pill" data-prompt="賃貸マンションの退去時、敷金の返還義務や原状回復費用について民法上のルールはどうなっていますか？">
                🏠 敷金返還と原状回復（民法）
              </button>
              <button class="topic-pill" data-prompt="業務委託契約で下請代金の支払期日や買いたたき規制について、下請法上のルールを教えてください。">
                ✍️ 下請法の支払期日と禁止事項
              </button>
              <button class="topic-pill" data-prompt="他人の著作物をブログやSNSで引用する際の要件について、著作権法32条を解説してください。">
                🎨 著作権法上の適法引用要件
              </button>
            </div>
          </div>
        </aside>

        <!-- メイン対話エリア -->
        <section class="librarian-main">
          <div class="chat-history" id="librarian-chat-log">
            <!-- 初期司書メッセージ -->
            <div class="chat-msg librarian">
              <div class="chat-avatar">🏛️</div>
              <div class="chat-bubble">
                <p><strong>ご来館ありがとうございます。</strong></p>
                <p>私は当アーカイブの主席司書アーサーでございます。日常の法律トラブル、条文の解釈、ビジネス規制など、どのようなご相談もお気軽にお話しください。</p>
                <p style="margin-top: 8px; font-size: 12.5px; color: var(--color-brass-dark);">
                  💡 左側の「よくあるご相談」ボタンを押すか、下の入力欄から送信いただくと、関連条文が即座に引き当てられます。条文バッジをクリックすると「地図・目録室」で全文をご覧いただけます。
                </p>
              </div>
            </div>
          </div>

          <!-- 入力バー -->
          <div class="chat-input-bar">
            <textarea id="librarian-input" class="chat-textarea" placeholder="例: 「ネット通販でクーリングオフできる？」「残業の上限規制は？」と入力 (Ctrl+Enterで送信)..."></textarea>
            <button id="btn-send-librarian" class="btn-royal-gold">
              <span>問合</span> 📤
            </button>
          </div>
        </section>
      </div>
    `;

    this.chatHistoryEl = document.getElementById('librarian-chat-log');
    this.chatInputEl = document.getElementById('librarian-input') as HTMLTextAreaElement;

    this.attachEvents();
  }

  private attachEvents(): void {
    const sendBtn = document.getElementById('btn-send-librarian');
    const clearBtn = document.getElementById('btn-clear-chat');

    sendBtn?.addEventListener('click', () => this.handleUserSubmit());

    this.chatInputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.handleUserSubmit();
      }
    });

    clearBtn?.addEventListener('click', () => {
      if (confirm('対話履歴を清掃して初期状態に戻しますか？')) {
        this.conversationContext = "";
        this.render();
      }
    });

    // クイックトピックボタン
    const topicBtns = this.container.querySelectorAll('.topic-pill');
    topicBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt && this.chatInputEl) {
          this.chatInputEl.value = prompt;
          this.handleUserSubmit();
        }
      });
    });
  }

  private async handleUserSubmit(): Promise<void> {
    if (!this.chatInputEl || this.isProcessing) return;
    const userQuery = this.chatInputEl.value.trim();
    if (!userQuery) return;

    this.chatInputEl.value = '';
    this.isProcessing = true;

    // ユーザーメッセージを追加
    this.appendMessage('user', userQuery);

    // 司書の考え中プレースホルダー
    const loadingId = 'loading-' + Date.now();
    this.appendMessage('librarian', `<span style="color: var(--color-brass-dark);">📜 司書がe-Gov法令APIおよび帝国アーカイブより条文を調査しております...</span>`, loadingId);

    try {
      // 1. e-Gov APIによる関連条文の高速引当
      const egovResults = await EgovApiService.searchKeyword(userQuery);

      // 2. Gemini APIによる法的論点整理・解説
      const response = await GeminiApiService.chatWithLibrarian(userQuery, this.conversationContext);
      
      // コンテキスト更新
      this.conversationContext += `\n相談者: ${userQuery}\n司書: ${response}\n`;

      // メッセージ更新
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) {
        let formattedText = response.replace(/\n/g, '<br>');

        // 条文引用バッジのHTML
        let citationsHtml = '';
        if (egovResults && egovResults.length > 0) {
          citationsHtml = `
            <div class="cited-laws-container">
              <span style="font-size: 11.5px; font-weight: 700; color: var(--color-brass-dark); text-transform: uppercase;">
                🏛️ e-Gov 法令API 関連条文引当 (クリックで目録室へジャンプ):
              </span><br>
              ${egovResults.map(r => `
                <button class="cited-law-badge jump-to-law-btn" data-law-id="${r.lawId}" data-art-num="${r.articleNum}" title="${r.text}">
                  📜 ${r.lawTitle} ${r.articleNum} ➔
                </button>
              `).join('')}
            </div>
          `;
        }

        loadingEl.innerHTML = `
          <div class="chat-bubble">
            <p>${formattedText}</p>
            ${citationsHtml}
            <div style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 6px;">
              <button class="btn-outline-classic btn-sm speak-reply-btn" style="font-size: 11px; padding: 4px 10px;">
                🔊 音声で拝聴する
              </button>
            </div>
          </div>
        `;

        // 条文クリック時のジャンプイベントバインド
        loadingEl.querySelectorAll('.jump-to-law-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const lawId = btn.getAttribute('data-law-id');
            const artNum = btn.getAttribute('data-art-num');
            if (lawId && this.onNavigateToLaw) {
              this.onNavigateToLaw(lawId, artNum || undefined);
            }
          });
        });

        // 音声読み上げボタンのバインド
        const speakBtn = loadingEl.querySelector('.speak-reply-btn');
        speakBtn?.addEventListener('click', () => {
          const plainText = response.replace(/[#*`]/g, '');
          SpeechService.speak(plainText, "司書アーサーの回答を拝聴中");
        });
      }
    } catch (err: any) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) {
        loadingEl.innerHTML = `<div class="chat-bubble" style="color: var(--color-crimson);">調査中に不都合が生じました: ${err.message}</div>`;
      }
    } finally {
      this.isProcessing = false;
      this.scrollToBottom();
    }
  }

  private appendMessage(role: 'user' | 'librarian', htmlContent: string, customId?: string): void {
    if (!this.chatHistoryEl) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${role}`;
    if (customId) msgDiv.id = customId;

    msgDiv.innerHTML = `
      <div class="chat-avatar">${role === 'user' ? '👤' : '🏛️'}</div>
      <div class="chat-bubble">
        ${htmlContent}
      </div>
    `;

    this.chatHistoryEl.appendChild(msgDiv);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.chatHistoryEl) {
      this.chatHistoryEl.scrollTop = this.chatHistoryEl.scrollHeight;
    }
  }
}
