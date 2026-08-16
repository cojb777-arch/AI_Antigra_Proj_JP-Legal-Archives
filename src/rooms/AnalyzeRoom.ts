/* =========================================================
   🔍 5. ANALYZE ROOM (約定解析室: 契約書PDF解析 & DB蓄積)
   ========================================================= */

import { GeminiApiService } from '../services/gemini-api';
import { StorageService, ContractArchiveItem } from '../services/storage';
import { marked } from 'marked';

export class AnalyzeRoom {
  private container: HTMLElement;
  private isAnalyzing: boolean = false;
  private currentReportMarkdown: string = "";
  private currentFileName: string = "";
  private currentBase64: string = "";
  private onDraftWithTemplate?: (archiveItem: ContractArchiveItem) => void;

  constructor(containerId: string, onDraftWithTemplate?: (archiveItem: ContractArchiveItem) => void) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.onDraftWithTemplate = onDraftWithTemplate;
  }

  public setDraftHandler(handler: (archiveItem: ContractArchiveItem) => void): void {
    this.onDraftWithTemplate = handler;
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="room-header">
        <div class="room-title-group">
          <span class="room-tag">THE CONTRACT ANALYSIS & ARCHIVE CHAMBER</span>
          <h2 class="room-title">🔍 約定解析室 <span style="font-size: 14px; font-weight: normal; color: var(--color-brass-dark);">〜 契約書PDF解析 ＆ 帝国約定データベース蓄積 〜</span></h2>
          <p class="room-desc">お手元の契約書（PDF・テキスト）を読み込ませることで、Geminiが不利な条項や法的リスク、日本法令（民法・下請法等）との適合性を深層審査します。審査済み契約書はデータベースに蓄積され、後の約定作成に活用できます。</p>
        </div>
      </div>

      <div class="analyze-layout">
        <!-- 左側：PDFアップロード ＆ 蓄積契約書一覧 -->
        <aside class="analyze-sidebar">
          <!-- ドロップゾーン -->
          <div class="pdf-drop-zone" id="pdf-drop-zone">
            <span class="drop-icon">📄</span>
            <div class="drop-title">契約書PDF / テキストを投下</div>
            <div class="drop-sub">ドラッグ＆ドロップ または クリックしてファイル選択</div>
            <input type="file" id="pdf-file-input" accept=".pdf,.txt,.md" style="display: none;">
          </div>

          <!-- 手動テキスト入力トグル -->
          <div>
            <button id="btn-toggle-manual-text" class="btn-outline-classic" style="width: 100%; justify-content: center; font-size: 12px;">
              ✍️ または契約書テキストを直接貼り付け
            </button>
            <div id="manual-text-input-box" style="margin-top: 8px; display: none;">
              <textarea id="contract-manual-textarea" class="chat-textarea" style="height: 110px; width: 100%;" placeholder="契約書の条文テキストを貼り付けてください..."></textarea>
              <button id="btn-analyze-manual-text" class="btn-royal-gold" style="width: 100%; margin-top: 6px; justify-content: center; font-size: 12px;">
                🔍 このテキストを解析
              </button>
            </div>
          </div>

          <!-- 蓄積契約書データベース書架 -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="preset-laws-title">🏛️ 蓄積約定データベース</span>
              <span id="contract-db-count" style="font-size: 11px; color: var(--text-sepia);"></span>
            </div>
            <div class="contract-db-shelf" id="contract-db-list"></div>
          </div>
        </aside>

        <!-- 右側：解析レポート表示エリア -->
        <section class="analyze-report-view">
          <div class="report-toolbar">
            <div id="report-status-badge" style="display: flex; align-items: center; gap: 8px;">
              <span class="legal-compliance-badge">🔏 契約書審査待機中</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="btn-use-as-template" class="btn-royal-gold btn-sm" style="display: none;">
                ✍️ この約定をベースに作成室で起案 ➔
              </button>
              <button id="btn-copy-report" class="btn-outline-classic btn-sm">
                📋 レポート複写
              </button>
            </div>
          </div>

          <div class="report-paper-body" id="report-paper-content">
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
              <span style="font-size: 44px; display: block; margin-bottom: 12px;">📜</span>
              <p style="font-size: 16px; font-weight: 700; color: var(--color-oxford-blue);">契約書の審査台</p>
              <p style="font-size: 13px;">左のエリアにPDFファイルを配置するか、蓄積データベースから契約書を選択してください。</p>
            </div>
          </div>
        </section>
      </div>
    `;

    this.attachEvents();
    this.renderDatabaseList();
  }

  private attachEvents(): void {
    const dropZone = document.getElementById('pdf-drop-zone');
    const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
    const manualToggleBtn = document.getElementById('btn-toggle-manual-text');
    const manualBox = document.getElementById('manual-text-input-box');
    const analyzeManualBtn = document.getElementById('btn-analyze-manual-text');
    const copyReportBtn = document.getElementById('btn-copy-report');
    const useAsTemplateBtn = document.getElementById('btn-use-as-template');

    // ファイル選択
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
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput?.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        this.handleFileUpload(fileInput.files[0]);
      }
    });

    // 手動テキストトグル
    manualToggleBtn?.addEventListener('click', () => {
      if (manualBox) {
        const isHidden = manualBox.style.display === 'none';
        manualBox.style.display = isHidden ? 'block' : 'none';
      }
    });

    // 手動テキスト解析
    analyzeManualBtn?.addEventListener('click', () => {
      const textarea = document.getElementById('contract-manual-textarea') as HTMLTextAreaElement;
      const text = textarea ? textarea.value.trim() : '';
      if (!text) {
        alert('契約書テキストを入力してください。');
        return;
      }
      this.executeAnalysis({ text, fileName: '直接入力契約書' });
    });

    // レポート複写
    copyReportBtn?.addEventListener('click', async () => {
      if (!this.currentReportMarkdown) {
        alert('解析レポートがまだございません。');
        return;
      }
      await navigator.clipboard.writeText(this.currentReportMarkdown);
      alert('📋 審査報告書をクリップボードに複写いたしました。');
    });

    // 作成室でテンプレートとして使用
    useAsTemplateBtn?.addEventListener('click', () => {
      const activeItem = StorageService.getContractArchives()[0];
      if (activeItem && this.onDraftWithTemplate) {
        this.onDraftWithTemplate(activeItem);
      }
    });
  }

  private handleFileUpload(file: File): void {
    this.currentFileName = file.name;
    const reader = new FileReader();

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        this.currentBase64 = base64Data;
        this.executeAnalysis({ pdfBase64: base64Data, fileName: file.name });
      };
      reader.readAsDataURL(file);
    } else {
      // テキスト・マークダウン
      reader.onload = () => {
        const text = reader.result as string;
        this.executeAnalysis({ text, fileName: file.name });
      };
      reader.readAsText(file);
    }
  }

  private async executeAnalysis(input: { text?: string; pdfBase64?: string; fileName?: string }): Promise<void> {
    const reportPaper = document.getElementById('report-paper-content');
    const statusBadge = document.getElementById('report-status-badge');
    const useAsTemplateBtn = document.getElementById('btn-use-as-template');
    if (!reportPaper) return;

    this.isAnalyzing = true;
    reportPaper.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--color-brass-dark);">
        <span style="font-size: 40px; display: block; margin-bottom: 12px;">🔍</span>
        <h3 style="font-size: 18px; color: var(--color-oxford-blue); font-weight: 700;">帝国法制審査官が契約書を深層解析中...</h3>
        <p style="font-size: 13px; color: var(--text-sepia); margin-top: 6px;">
          条項の抽出、不利条項の検知、民法・下請法・フリーランス新法との照合を実施しております。
        </p>
      </div>
    `;

    try {
      const reportMd = await GeminiApiService.analyzeContract(input);
      this.currentReportMarkdown = reportMd;

      // リスク判定の抽出（簡易判定）
      let riskLevel: '低' | '中' | '高' = '中';
      let riskTagClass = 'medium';
      if (reportMd.includes('高リスク') || reportMd.includes('🔴')) {
        riskLevel = '高';
        riskTagClass = 'high';
      } else if (reportMd.includes('低リスク') || reportMd.includes('🟢')) {
        riskLevel = '低';
        riskTagClass = 'low';
      }

      // レポート表示
      const html = marked.parse(reportMd) as string;
      reportPaper.innerHTML = `<div class="rendered-report-container">${html}</div>`;

      if (statusBadge) {
        statusBadge.innerHTML = `
          <span class="risk-tag ${riskTagClass}" style="font-size: 12px; padding: 4px 10px;">
            リスク判定: ${riskLevel}
          </span>
          <span style="font-size: 12px; font-weight: 700; color: var(--color-oxford-blue);">
            📄 ${input.fileName || '契約書'}
          </span>
        `;
      }

      // データベースに蓄積保存
      const newArchive = StorageService.addContractArchive({
        title: input.fileName ? input.fileName.replace(/\.[^/.]+$/, "") : '解析契約書',
        fileName: input.fileName,
        contractType: '解析済み約定',
        summary: `審査日: ${new Date().toLocaleDateString('ja-JP')} / リスク判定: ${riskLevel}`,
        riskLevel,
        keyClauses: [],
        complianceLaws: ['民法', '下請法'],
        fullAnalysisText: reportMd,
        rawText: input.text
      });

      this.renderDatabaseList();

      if (useAsTemplateBtn) {
        useAsTemplateBtn.style.display = 'inline-flex';
        useAsTemplateBtn.onclick = () => {
          if (this.onDraftWithTemplate) {
            this.onDraftWithTemplate(newArchive);
          }
        };
      }

    } catch (err: any) {
      reportPaper.innerHTML = `<div style="color: var(--color-crimson); padding: 20px;">解析中に不都合が生じました: ${err.message}</div>`;
    } finally {
      this.isAnalyzing = false;
    }
  }

  private renderDatabaseList(): void {
    const listEl = document.getElementById('contract-db-list');
    const countEl = document.getElementById('contract-db-count');
    if (!listEl) return;

    const archives = StorageService.getContractArchives();
    if (countEl) countEl.textContent = `(${archives.length}件保管)`;

    if (archives.length === 0) {
      listEl.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 16px;">蓄積された契約書はございません。</div>`;
      return;
    }

    listEl.innerHTML = archives.map(item => {
      let riskClass = 'medium';
      if (item.riskLevel === '低') riskClass = 'low';
      if (item.riskLevel === '高') riskClass = 'high';

      return `
        <div class="contract-db-item" data-id="${item.id}">
          <div class="contract-db-title">
            <span>📜 ${item.title}</span>
            <span class="risk-tag ${riskClass}">${item.riskLevel}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-sepia);">
            ${item.contractType} (${new Date(item.uploadedAt).toLocaleDateString('ja-JP')})
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.contract-db-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const item = archives.find(a => a.id === id);
        if (item) {
          this.showArchiveDetail(item);
        }
      });
    });
  }

  private showArchiveDetail(item: ContractArchiveItem): void {
    const reportPaper = document.getElementById('report-paper-content');
    const statusBadge = document.getElementById('report-status-badge');
    const useAsTemplateBtn = document.getElementById('btn-use-as-template');
    if (!reportPaper) return;

    this.currentReportMarkdown = item.fullAnalysisText;

    let riskClass = item.riskLevel === '低' ? 'low' : (item.riskLevel === '高' ? 'high' : 'medium');

    if (statusBadge) {
      statusBadge.innerHTML = `
        <span class="risk-tag ${riskClass}" style="font-size: 12px; padding: 4px 10px;">
          リスク判定: ${item.riskLevel}
        </span>
        <span style="font-size: 12px; font-weight: 700; color: var(--color-oxford-blue);">
          🏛️ 蓄積DB: ${item.title}
        </span>
      `;
    }

    const html = marked.parse(item.fullAnalysisText) as string;
    reportPaper.innerHTML = `<div class="rendered-report-container">${html}</div>`;

    if (useAsTemplateBtn) {
      useAsTemplateBtn.style.display = 'inline-flex';
      useAsTemplateBtn.onclick = () => {
        if (this.onDraftWithTemplate) {
          this.onDraftWithTemplate(item);
        }
      };
    }
  }
}
