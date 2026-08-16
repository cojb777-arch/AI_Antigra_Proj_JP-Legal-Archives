/* =========================================================
   🎓 7. EXAM & RECITATION ROOM (試問・素読室 & 5大国家資格過去問室)
   ========================================================= */

import { EXAM_DATABASE, ExamQuestion, QUALIFICATIONS } from '../data/exam-questions';
import { StorageService } from '../services/storage';
import { GeminiApiService } from '../services/gemini-api';
import { SpeechService } from '../services/speech';
import confetti from 'canvas-confetti';

export class ExamRoom {
  private container: HTMLElement;
  private currentMode: 'exam-archive' | 'cloze-recite' = 'exam-archive';
  private selectedQual: string = '行政書士';
  private currentQuestionIndex: number = 0;
  private filteredQuestions: ExamQuestion[] = [];
  private answeredQuestions: { [id: string]: { selected: number; isCorrect: boolean } } = {};
  private onNavigateToLaw?: (lawId: string, articleNum?: string) => void;
  private isUploading: boolean = false;

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
          <span class="room-tag">THE GRAND EXAM & RECITATION HALL</span>
          <h2 class="room-title">🎓 試問・素読室 <span style="font-size: 14px; font-weight: normal; color: var(--color-brass-dark);">〜 5大国家資格過去問アーカイブ ＆ 条文素読暗記 〜</span></h2>
          <p class="room-desc">帝国法曹・会計人を志す学徒のための試問室。行政書士・司法書士・司法試験・税理士・公認会計士の過去問演習に加え、お手元の過去問ファイル（PDF/Word/テキスト）を格納して問題を作成できます。</p>
        </div>
      </div>

      <div class="exam-layout">
        <!-- 上部ツールバー -->
        <div class="exam-top-toolbar">
          <!-- モード切替タブ -->
          <div class="exam-mode-switch">
            <button class="btn-mode-tab ${this.currentMode === 'exam-archive' ? 'active' : ''}" data-mode="exam-archive">
              🏛️ 国家資格 過去問書架
            </button>
            <button class="btn-mode-tab ${this.currentMode === 'cloze-recite' ? 'active' : ''}" data-mode="cloze-recite">
              📜 条文素読 ＆ 穴埋め暗記テスト
            </button>
          </div>

          <!-- 過去問アップロードボタン -->
          <button id="btn-toggle-exam-upload" class="btn-royal-gold" style="font-size: 13px; padding: 8px 16px;">
            <span>📤 過去問ファイル（PDF/Word等）を格納して問題作成</span>
          </button>
        </div>

        <!-- 過去問アップロード展開パネル（初期非表示） -->
        <div id="exam-upload-panel" style="display: none;">
          <div class="exam-upload-card" id="exam-drop-zone">
            <span style="font-size: 36px; display: block; margin-bottom: 6px;">📄</span>
            <h4 style="color: var(--color-oxford-blue); font-size: 15px; font-weight: 700;">過去問ファイル（PDF / Word / テキスト）をドロップ</h4>
            <p style="font-size: 12px; color: var(--text-sepia); margin-top: 2px;">
              ドラッグ＆ドロップ または クリックしてファイル選択（Gemini AIが肢・正解・条文を自動抽出して書架に格納します）
            </p>
            <input type="file" id="exam-file-input" accept=".pdf,.doc,.docx,.txt,.md" style="display: none;">
          </div>
        </div>

        <!-- コンテンツ領域 -->
        <div id="exam-mode-container"></div>
      </div>
    `;

    this.attachEvents();
    this.renderModeContent();
  }

  private attachEvents(): void {
    // モード切り替え
    this.container.querySelectorAll('.btn-mode-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as 'exam-archive' | 'cloze-recite';
        if (mode) {
          this.currentMode = mode;
          this.container.querySelectorAll('.btn-mode-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderModeContent();
        }
      });
    });

    // アップロードトグル
    const toggleUploadBtn = document.getElementById('btn-toggle-exam-upload');
    const uploadPanel = document.getElementById('exam-upload-panel');
    toggleUploadBtn?.addEventListener('click', () => {
      if (uploadPanel) {
        const isHidden = uploadPanel.style.display === 'none';
        uploadPanel.style.display = isHidden ? 'block' : 'none';
      }
    });

    // ファイルドロップゾーン
    const dropZone = document.getElementById('exam-drop-zone');
    const fileInput = document.getElementById('exam-file-input') as HTMLInputElement;

    dropZone?.addEventListener('click', () => fileInput?.click());

    dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone?.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.handleExamFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput?.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        this.handleExamFileUpload(fileInput.files[0]);
      }
    });
  }

  private async handleExamFileUpload(file: File): Promise<void> {
    const uploadPanel = document.getElementById('exam-upload-panel');
    if (!uploadPanel) return;

    uploadPanel.innerHTML = `
      <div style="background: #FFF; border: 1px solid var(--color-brass-gold); border-radius: var(--radius-md); padding: 30px; text-align: center;">
        <span style="font-size: 36px; display: block; margin-bottom: 8px;">⏳</span>
        <h4 style="color: var(--color-oxford-blue); font-size: 16px; font-weight: 700;">過去問ファイル「${file.name}」を解読中...</h4>
        <p style="font-size: 13px; color: var(--text-sepia); margin-top: 4px;">
          Gemini AIが問題文、選択肢、正解、根拠法令・条文を抽出して問題カードを作成しております。
        </p>
      </div>
    `;

    const reader = new FileReader();

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        await this.processParsedExam({ fileBase64: base64Data, mimeType: 'application/pdf', fileName: file.name });
      };
      reader.readAsDataURL(file);
    } else {
      // テキスト・Wordテキスト
      reader.onload = async () => {
        const text = reader.result as string;
        await this.processParsedExam({ text, fileName: file.name });
      };
      reader.readAsText(file);
    }
  }

  private async processParsedExam(input: { text?: string; fileBase64?: string; mimeType?: string; fileName?: string }): Promise<void> {
    try {
      const generatedQuestions = await GeminiApiService.parseExamFromDocument(input);
      // DBに格納
      StorageService.addCustomExamQuestions(generatedQuestions);

      alert(`🎉 過去問ファイルより ${generatedQuestions.length} 問の問題を抽出し、書架に格納いたしました！`);
      
      // アップロードした問題の資格カテゴリへ自動切り替え
      if (generatedQuestions[0] && generatedQuestions[0].qualification) {
        this.selectedQual = generatedQuestions[0].qualification;
      }

      this.render();
    } catch (err: any) {
      alert(`問題の抽出中に不都合が生じました: ${err.message}`);
      this.render();
    }
  }

  private renderModeContent(): void {
    const container = document.getElementById('exam-mode-container');
    if (!container) return;

    if (this.currentMode === 'exam-archive') {
      this.renderExamArchives(container);
    } else {
      this.renderClozeRecitation(container);
    }
  }

  /* =========================================================
     🏛️ 国家資格 過去問書架の実装（プリセット＋アップロードDB統合）
     ========================================================= */
  private renderExamArchives(container: HTMLElement): void {
    // プリセット問題 ＋ ユーザーアップロードカスタム問題を統合
    const customQuestions = StorageService.getCustomExamQuestions();
    const allQuestions = [...customQuestions, ...EXAM_DATABASE];

    // 全ての資格リスト（カスタム資格も含む）
    const allQualIds = Array.from(new Set([...QUALIFICATIONS.map(q => q.id), ...customQuestions.map(q => q.qualification)]));

    const qualCardsData = allQualIds.map(qId => {
      const preset = QUALIFICATIONS.find(q => q.id === qId);
      const count = allQuestions.filter(q => q.qualification === qId).length;
      if (preset) {
        return { ...preset, totalCount: `${count}問収録` };
      } else {
        return {
          id: qId,
          name: `${qId} 過去問室`,
          icon: '📁',
          desc: 'ユーザー格納問題',
          totalCount: `${count}問収録`
        };
      }
    });

    this.filteredQuestions = allQuestions.filter(q => q.qualification === this.selectedQual);
    if (this.filteredQuestions.length === 0) {
      this.filteredQuestions = allQuestions.slice(0, 1);
      this.selectedQual = this.filteredQuestions[0].qualification;
    }
    if (this.currentQuestionIndex >= this.filteredQuestions.length) {
      this.currentQuestionIndex = 0;
    }

    const currentQ = this.filteredQuestions[this.currentQuestionIndex];
    const answerState = this.answeredQuestions[currentQ.id];

    container.innerHTML = `
      <!-- 資格 書架セレクター -->
      <div style="margin-bottom: 20px;">
        <span class="quick-topics-label" style="display: block; margin-bottom: 8px;">🏛️ 資格別 書架（バインダー）を選択:</span>
        <div class="qualification-shelf">
          ${qualCardsData.map(q => `
            <div class="qual-binder-card ${q.id === this.selectedQual ? 'active' : ''}" data-qual="${q.id}">
              <div class="qual-icon">${q.icon}</div>
              <div class="qual-title">${q.name}</div>
              <div class="qual-count">${q.desc} (${q.totalCount})</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 問題演習パネル -->
      <div class="quiz-hall">
        <div class="quiz-meta-bar">
          <div>
            <span class="quiz-qual-badge">${currentQ.qualification}</span>
            <span style="font-weight: 700; margin-left: 8px; color: var(--color-oxford-blue); font-size: 14px;">
              ${currentQ.year} ${currentQ.subject} 【${currentQ.questionNumber}】
            </span>
          </div>
          <div style="font-size: 13px; color: var(--text-sepia);">
            問 ${this.currentQuestionIndex + 1} / ${this.filteredQuestions.length}
          </div>
        </div>

        <div class="quiz-question-box">
          ${currentQ.questionText}
        </div>

        <!-- 選択肢 -->
        <div class="quiz-options-list">
          ${currentQ.options.map((opt, idx) => {
            let stateClass = '';
            if (answerState) {
              if (idx === currentQ.correctIndex) {
                stateClass = 'selected-correct';
              } else if (idx === answerState.selected && !answerState.isCorrect) {
                stateClass = 'selected-wrong';
              }
            }
            return `
              <button class="quiz-option-btn ${stateClass}" data-idx="${idx}" ${answerState ? 'disabled' : ''}>
                <span style="font-weight: bold; min-width: 24px;">(${idx + 1})</span>
                <span>${opt}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- 解答後の解説表示 -->
        ${answerState ? `
          <div class="quiz-explanation-card">
            <div class="explanation-title">
              <span>${answerState.isCorrect ? '🎉 正解でございます！' : '❌ 残念、不正解でございます'}</span>
              <span style="font-size: 12px; font-weight: normal; margin-left: auto;">正解: (${currentQ.correctIndex + 1})</span>
            </div>
            <p style="font-size: 14px; color: var(--text-ink-body); line-height: 1.7; margin-bottom: 12px;">
              ${currentQ.explanation}
            </p>

            <!-- 該当法令条文バッジ -->
            <div style="background: #FFF; border: 1px solid var(--color-brass-gold); border-radius: 4px; padding: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: var(--color-brass-dark); text-transform: uppercase;">
                  🏛️ 根拠法令・条文:
                </span>
                <h4 style="font-size: 14.5px; color: var(--color-oxford-blue); margin: 2px 0 4px 0;">
                  📜 ${currentQ.relatedLaw.lawTitle} ${currentQ.relatedLaw.articleNum}
                </h4>
                <p style="font-size: 13px; color: var(--text-sepia); font-style: italic;">
                  "${currentQ.relatedLaw.keyQuote}"
                </p>
              </div>
              <button id="btn-jump-from-quiz" class="btn-royal-gold" style="font-size: 12px; padding: 6px 12px;">
                🗺️ 目録室で条文全文を開く ➔
              </button>
            </div>

            <!-- アクションボタン -->
            <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
              <button id="btn-ai-explain-q" class="btn-royal-gold" style="font-size: 12px;">
                🤖 AI司書による深層指導解説
              </button>
              <button id="btn-next-question" class="btn-sealing-wax" style="font-size: 12px;">
                次の問題へ進む ➔
              </button>
            </div>

            <!-- AI深層解説コンテナ -->
            <div id="ai-deep-explanation" style="margin-top: 14px; display: none;"></div>
          </div>
        ` : ''}
      </div>
    `;

    // 資格バインダー切り替え
    container.querySelectorAll('.qual-binder-card').forEach(card => {
      card.addEventListener('click', () => {
        const qual = card.getAttribute('data-qual');
        if (qual) {
          this.selectedQual = qual;
          this.currentQuestionIndex = 0;
          this.renderExamArchives(container);
        }
      });
    });

    // 選択肢クリック
    container.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedIdx = parseInt(btn.getAttribute('data-idx') || '0', 10);
        const isCorrect = selectedIdx === currentQ.correctIndex;

        this.answeredQuestions[currentQ.id] = { selected: selectedIdx, isCorrect };

        if (isCorrect) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }

        this.renderExamArchives(container);
      });
    });

    // 目録室への条文ジャンプ
    document.getElementById('btn-jump-from-quiz')?.addEventListener('click', () => {
      if (this.onNavigateToLaw) {
        this.onNavigateToLaw(currentQ.relatedLaw.lawId, currentQ.relatedLaw.articleNum);
      }
    });

    // 次の問題
    document.getElementById('btn-next-question')?.addEventListener('click', () => {
      this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.filteredQuestions.length;
      this.renderExamArchives(container);
    });

    // AI深層解説ボタン
    document.getElementById('btn-ai-explain-q')?.addEventListener('click', async () => {
      const aiBox = document.getElementById('ai-deep-explanation');
      if (!aiBox) return;
      aiBox.style.display = 'block';
      aiBox.innerHTML = `<div style="color: var(--color-brass-dark); font-size: 13px;">📜 帝国司書が条文の判例・学説を踏まえた個別指導書を起草しております...</div>`;

      const optUser = `(${answerState.selected + 1}) ${currentQ.options[answerState.selected]}`;
      const optCorrect = `(${currentQ.correctIndex + 1}) ${currentQ.options[currentQ.correctIndex]}`;

      const aiText = await GeminiApiService.explainExamQuestion(
        currentQ.qualification,
        currentQ.questionText,
        optUser,
        optCorrect,
        currentQ.explanation
      );

      aiBox.innerHTML = `
        <div style="background: #FFF; border: 1px dashed var(--color-brass-gold); border-radius: 4px; padding: 14px; font-size: 13.5px; line-height: 1.8;">
          <h5 style="color: var(--color-oxford-blue); font-weight: 700; margin-bottom: 6px;">🏛️ 司書アーサーの指導ノート:</h5>
          ${aiText.replace(/\n/g, '<br>')}
        </div>
      `;
    });
  }

  /* =========================================================
     📜 条文素読 ＆ 穴埋め暗記テストの実装
     ========================================================= */
  private renderClozeRecitation(container: HTMLElement): void {
    const defaultText = `【民法 第709条】故意又は過失によって他人の権利又は法律上保護される利益を侵害した者は、これによって生じた損害を賠償する責任を負う。
【民法 第95条】意思表示は、次に掲げる錯誤に基づくものであって、その錯誤が法律行為の目的及び取引上の社会通念に照らして重要なものであるときは、取り消すことができる。
【日本国憲法 第14条】すべて国民は、法の下に平等であつて、人種、信条、性別、社会的身分又は門地により、政治的、経済的又は社会的関係において、差別されない。`;

    container.innerHTML = `
      <div class="parchment-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--color-oxford-blue);">
            📜 穴埋め暗記マスキング ＆ 音声素読デスク
          </h3>
          <div style="display: flex; gap: 8px;">
            <button id="btn-toggle-mask" class="btn-royal-gold" style="font-size: 12px; padding: 5px 12px;">
              🎭 重要キーワードを隠す / 表す
            </button>
            <button id="btn-recite-cloze" class="btn-sealing-wax" style="font-size: 12px; padding: 5px 12px;">
              🔊 音声で素読する
            </button>
          </div>
        </div>

        <p style="font-size: 12px; color: var(--text-sepia); margin-bottom: 12px;">
          黒塗りの重要キーワード（要件・効果・期間など）をクリックすると、答えがめくられます。
        </p>

        <div id="cloze-study-board" style="background: #FFF; border: 1px solid var(--border-antique); border-radius: var(--radius-sm); padding: 20px; font-size: 16px; line-height: 2.2;"></div>
      </div>
    `;

    const board = document.getElementById('cloze-study-board');
    if (!board) return;

    const keywords = ['故意又は過失', '損害を賠償する責任', '錯誤', '取り消すことができる', '法の下に平等', '社会的身分又は門地', '差別されない', '公共の福祉'];
    let processedHtml = defaultText;

    keywords.forEach(kw => {
      const reg = new RegExp(kw, 'g');
      processedHtml = processedHtml.replace(reg, `<span class="cloze-word" title="クリックでめくる">${kw}</span>`);
    });

    board.innerHTML = processedHtml.replace(/\n/g, '<br><br>');

    board.querySelectorAll('.cloze-word').forEach(span => {
      span.addEventListener('click', () => {
        span.classList.toggle('revealed');
      });
    });

    let allRevealed = false;
    document.getElementById('btn-toggle-mask')?.addEventListener('click', () => {
      allRevealed = !allRevealed;
      board.querySelectorAll('.cloze-word').forEach(span => {
        if (allRevealed) span.classList.add('revealed');
        else span.classList.remove('revealed');
      });
    });

    document.getElementById('btn-recite-cloze')?.addEventListener('click', () => {
      SpeechService.speak(defaultText, "重要条文 素読演習");
    });
  }
}
