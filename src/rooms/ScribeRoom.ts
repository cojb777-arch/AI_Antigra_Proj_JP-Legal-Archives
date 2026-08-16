/* =========================================================
   ✍️ 6. CONTRACT DRAFTING ROOM (約定作成室: 旧 写字室)
   〜 蓄積約定データベース連携 契約書ドラフト起案 〜
   ========================================================= */

import { GeminiApiService } from '../services/gemini-api';
import { StorageService, ContractArchiveItem } from '../services/storage';
import { marked } from 'marked';

interface ContractTemplate {
  type: string;
  name: string;
  defaultParties: string;
  defaultDetails: string;
  defaultClauses: string;
}

const TEMPLATES: ContractTemplate[] = [
  {
    type: 'service',
    name: '業務委託契約書（準委任/請負）',
    defaultParties: '甲：株式会社帝国商事（委託者）\n乙：山田太郎（受託者・フリーランス）',
    defaultDetails: '・業務内容: Webシステム設計開発および運用保守\n・委託料: 月額金500,000円（消費税別）\n・支払期日: 翌月末日限り乙の指定銀行口座へ振込\n・契約期間: 令和 年 月 日から1年間',
    defaultClauses: '・成果物の著作権は対価完納により甲に移転（著作者人格権不行使）\n・フリーランス新法第3条および下請法第3条の明示要件を充足させること\n・秘密保持義務および再委託の事前承諾規定を含む'
  },
  {
    type: 'nda',
    name: '秘密保持契約書（NDA）',
    defaultParties: '甲：帝国イノベーション株式会社\n乙：大日本法律事務所',
    defaultDetails: '・目的: 共同事業の検討および技術検証\n・開示情報: 営業上・技術上の一切の秘密情報\n・有効期間: 開示日より3年間',
    defaultClauses: '・秘密情報の目的外使用禁止\n・複製制限および返還・破棄義務\n・損害賠償および差止請求権の明記'
  },
  {
    type: 'terms',
    name: 'Webサービス利用規約',
    defaultParties: '当社（サービス運営者）および 登録ユーザー',
    defaultDetails: '・サービス名: クラウド法務支援サービス\n・利用料金: 月額サブスクリプション制\n・アカウント管理: 1人1アカウント、パスワード自己責任',
    defaultClauses: '・消費者契約法第8条（免責条項の無効）に配慮し、当社に故意・重過失がある場合を除く限定的免責\n・禁止事項およびアカウント停止基準の明記\n・反社会的勢力の排除条項'
  },
  {
    type: 'sales',
    name: '商品売買契約書',
    defaultParties: '甲：売主（帝国物産）\n乙：買主（東京商事）',
    defaultDetails: '・売買目的物: 工業用部品 一式\n・引渡場所: 乙の指定倉庫（持参債務）\n・代金および支払条件: 納品検収後30日以内',
    defaultClauses: '・契約不適合責任（民法第562条以下）の通知期間および責任範囲\n・危険負担の移転時期（引渡完了時）\n・所有権移転時期（完納時）'
  }
];

export class ScribeRoom {
  private container: HTMLElement;
  private selectedTemplate: ContractTemplate = TEMPLATES[0];
  private isGenerating: boolean = false;
  private generatedDocText: string = "";
  private selectedDbReferenceId: string = "";

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
  }

  public render(): void {
    const dbArchives = StorageService.getContractArchives();

    this.container.innerHTML = `
      <div class="room-header">
        <div class="room-title-group">
          <span class="room-tag">THE CONTRACT DRAFTING & SCRIBE ROOM</span>
          <h2 class="room-title">✍️ 約定作成室 <span style="font-size: 14px; font-weight: normal; color: var(--color-brass-dark);">〜 蓄積約定DB連携 ＆ 法令適合契約書起案 〜</span></h2>
          <p class="room-desc">最新の民法・下請法・フリーランス新法等に厳格に準拠した契約書を自動起案します。約定解析室で蓄積した契約書DBをベースに、自社に有利で安全な約定を作成できます。</p>
        </div>
      </div>

      <div class="scribe-layout">
        <!-- 左側：契約条件設定フォーム -->
        <div class="scribe-params-panel">
          <!-- 蓄積契約書DBの参照セレクター -->
          <div style="background: #FFF; border: 1px solid var(--color-brass-gold); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 4px;">
            <label class="label-title" style="font-size: 13px; color: var(--color-oxford-blue); display: flex; align-items: center; gap: 6px;">
              <span>🏛️ 約定解析室の蓄積DBを参照</span>
            </label>
            <select id="select-db-reference" class="select-classic" style="width: 100%; margin-top: 4px; font-size: 12px;">
              <option value="">-- 蓄積DBを参照しない（標準ひな形） --</option>
              ${dbArchives.map(a => `
                <option value="${a.id}">📜 ${a.title} (${a.riskLevel}リスク)</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="label-title">📜 標準契約種別</label>
            <div class="contract-type-select" id="contract-type-buttons">
              ${TEMPLATES.map(t => `
                <button class="btn-contract-type ${t.type === this.selectedTemplate.type ? 'active' : ''}" data-type="${t.type}">
                  ${t.name.split('（')[0]}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="label-title" for="scribe-parties">👥 契約当事者（甲・乙等）</label>
            <textarea id="scribe-parties" class="chat-textarea" style="height: 60px;">${this.selectedTemplate.defaultParties}</textarea>
          </div>

          <div class="form-group">
            <label class="label-title" for="scribe-details">📝 業務・取引の主要条件</label>
            <textarea id="scribe-details" class="chat-textarea" style="height: 90px;">${this.selectedTemplate.defaultDetails}</textarea>
          </div>

          <div class="form-group">
            <label class="label-title" for="scribe-clauses">⚖️ 法的特約・重要要望事項</label>
            <textarea id="scribe-clauses" class="chat-textarea" style="height: 80px;">${this.selectedTemplate.defaultClauses}</textarea>
          </div>

          <button id="btn-generate-contract" class="btn-royal-gold" style="width: 100%; justify-content: center; padding: 12px;">
            <span>✒️</span> 契約書を起案・清書する
          </button>
        </div>

        <!-- 右側：契約書プレビュー＆法令チェック -->
        <div class="scribe-doc-output">
          <div class="scribe-toolbar">
            <div class="legal-compliance-badge">
              <span>🔏 帝国法令適合チェック済</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="btn-copy-contract" class="btn-outline-classic btn-sm">
                📋 全文複写
              </button>
              <button id="btn-download-md" class="btn-outline-classic btn-sm">
                💾 羊皮紙（MD）保存
              </button>
              <button id="btn-print-doc" class="btn-outline-classic btn-sm">
                🖨️ 印刷清書
              </button>
            </div>
          </div>

          <div class="doc-paper-view" id="scribe-paper-content">
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
              <span style="font-size: 44px; display: block; margin-bottom: 12px;">📜</span>
              <p style="font-size: 16px; font-weight: 700; color: var(--color-oxford-blue);">契約書の白紙羊皮紙</p>
              <p style="font-size: 13px;">左の条件を確認し、「契約書を起案・清書する」ボタンを押してください。</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    // テンプレート切り替え
    this.container.querySelectorAll('.btn-contract-type').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const found = TEMPLATES.find(t => t.type === type);
        if (found) {
          this.selectedTemplate = found;
          this.container.querySelectorAll('.btn-contract-type').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const partiesEl = document.getElementById('scribe-parties') as HTMLTextAreaElement;
          const detailsEl = document.getElementById('scribe-details') as HTMLTextAreaElement;
          const clausesEl = document.getElementById('scribe-clauses') as HTMLTextAreaElement;
          if (partiesEl) partiesEl.value = found.defaultParties;
          if (detailsEl) detailsEl.value = found.defaultDetails;
          if (clausesEl) clausesEl.value = found.defaultClauses;
        }
      });
    });

    // DB参照セレクター
    const selectDb = document.getElementById('select-db-reference') as HTMLSelectElement;
    selectDb?.addEventListener('change', () => {
      this.selectedDbReferenceId = selectDb.value;
      if (this.selectedDbReferenceId) {
        const item = StorageService.getContractArchives().find(a => a.id === this.selectedDbReferenceId);
        if (item) {
          const clausesEl = document.getElementById('scribe-clauses') as HTMLTextAreaElement;
          if (clausesEl) {
            clausesEl.value += `\n・蓄積DB「${item.title}」の審査結果に基づき、法的リスクを低減した公正な条項とすること。`;
          }
        }
      }
    });

    // 起案ボタン
    document.getElementById('btn-generate-contract')?.addEventListener('click', () => this.handleGenerate());

    // 複写
    document.getElementById('btn-copy-contract')?.addEventListener('click', async () => {
      if (!this.generatedDocText) {
        alert('起案された契約書がまだございません。');
        return;
      }
      await navigator.clipboard.writeText(this.generatedDocText);
      alert('📋 契約書ドラフトをクリップボードに複写いたしました。');
    });

    // MD保存
    document.getElementById('btn-download-md')?.addEventListener('click', () => {
      if (!this.generatedDocText) {
        alert('起案された契約書がまだございません。');
        return;
      }
      const blob = new Blob([this.generatedDocText], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${this.selectedTemplate.name}_ドラフト.md`;
      a.click();
    });

    // 印刷
    document.getElementById('btn-print-doc')?.addEventListener('click', () => {
      const paper = document.getElementById('scribe-paper-content');
      if (!paper || !this.generatedDocText) {
        alert('起案された契約書がまだございません。');
        return;
      }
      window.print();
    });
  }

  public loadWithArchiveItem(item: ContractArchiveItem): void {
    this.render();
    const selectDb = document.getElementById('select-db-reference') as HTMLSelectElement;
    if (selectDb) selectDb.value = item.id;
    this.selectedDbReferenceId = item.id;

    const clausesEl = document.getElementById('scribe-clauses') as HTMLTextAreaElement;
    if (clausesEl) {
      clausesEl.value = `・約定解析室の蓄積契約書「${item.title}」を下敷きにし、その審査結果・留意事項を反映した最新条項とすること。\n・下請法第3条、民法等の法令適合要件を満たすこと。`;
    }

    const detailsEl = document.getElementById('scribe-details') as HTMLTextAreaElement;
    if (detailsEl && item.summary) {
      detailsEl.value += `\n・参考概要: ${item.summary}`;
    }
  }

  private async handleGenerate(): Promise<void> {
    if (this.isGenerating) return;

    const parties = (document.getElementById('scribe-parties') as HTMLTextAreaElement).value;
    const details = (document.getElementById('scribe-details') as HTMLTextAreaElement).value;
    const clauses = (document.getElementById('scribe-clauses') as HTMLTextAreaElement).value;

    const paperEl = document.getElementById('scribe-paper-content');
    if (!paperEl) return;

    this.isGenerating = true;
    paperEl.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--color-brass-dark);">
        <span style="font-size: 36px; display: block; margin-bottom: 12px;">✒️</span>
        <p style="font-weight: 700; font-size: 16px;">法制執筆官が蓄積DBおよび日本現行法令に基づき約定を起案中...</p>
        <p style="font-size: 13px; color: var(--text-sepia);">民法、下請法、各種業法との整合性を検証しております。</p>
      </div>
    `;

    try {
      let refContext = "";
      if (this.selectedDbReferenceId) {
        const item = StorageService.getContractArchives().find(a => a.id === this.selectedDbReferenceId);
        if (item) {
          refContext = `参考契約書名: ${item.title}\n解析概要: ${item.summary}\n審査所見: ${item.fullAnalysisText.slice(0, 1000)}`;
        }
      }

      const docMarkdown = await GeminiApiService.generateContract(
        this.selectedTemplate.name,
        parties,
        details,
        clauses,
        refContext
      );

      this.generatedDocText = docMarkdown;
      const html = marked.parse(docMarkdown) as string;

      paperEl.innerHTML = `
        <div class="contract-rendered-document" style="max-width: 800px; margin: 0 auto;">
          ${html}
        </div>
      `;
    } catch (err: any) {
      paperEl.innerHTML = `<div style="color: var(--color-crimson); padding: 20px;">契約書の起案中に不都合が生じました: ${err.message}</div>`;
    } finally {
      this.isGenerating = false;
    }
  }
}
