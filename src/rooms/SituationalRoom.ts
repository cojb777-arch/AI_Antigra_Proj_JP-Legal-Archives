/* =========================================================
   📋 4. SITUATIONAL ROOM (実務相談窓口: シチュエーション逆引き)
   ========================================================= */

import { SITUATIONS_DATA, SituationCategory } from '../data/situations';
import { GeminiApiService } from '../services/gemini-api';

export class SituationalRoom {
  private container: HTMLElement;
  private selectedSituation: SituationCategory = SITUATIONS_DATA[0];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="room-header">
        <div class="room-title-group">
          <span class="room-tag">THE SITUATIONAL CONSULTATION DESK</span>
          <h2 class="room-title">📋 実務相談窓口 <span style="font-size: 14px; font-weight: normal; color: var(--color-brass-dark);">〜 目的・業種別 法令逆引きロードマップ 〜</span></h2>
          <p class="room-desc">「起業したい」「お店を開きたい」など、あなたの実現したい目的から、守るべき法令・届出事項・必要条文をステップ順に逆引きしてご案内いたします。</p>
        </div>
      </div>

      <div class="situational-layout">
        <!-- 目的別カード選択 -->
        <div>
          <span class="quick-topics-label" style="margin-bottom: 10px; display: block;">🏛️ ご相談の場面・業種を選択:</span>
          <div class="situation-categories-grid">
            ${SITUATIONS_DATA.map(s => `
              <div class="situation-card ${s.id === this.selectedSituation.id ? 'active' : ''}" data-id="${s.id}">
                <div class="situation-icon">${s.icon}</div>
                <div class="situation-name">${s.name}</div>
                <div class="situation-brief">${s.brief}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 選択中のシチュエーション詳細・チェックリスト -->
        <div class="situation-detail-panel" id="situation-detail-content"></div>
      </div>
    `;

    this.attachEvents();
    this.renderDetail();
  }

  private attachEvents(): void {
    this.container.querySelectorAll('.situation-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const found = SITUATIONS_DATA.find(s => s.id === id);
        if (found) {
          this.selectedSituation = found;
          this.container.querySelectorAll('.situation-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.renderDetail();
        }
      });
    });
  }

  private renderDetail(): void {
    const contentEl = document.getElementById('situation-detail-content');
    if (!contentEl) return;

    contentEl.innerHTML = `
      <div class="situation-banner">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 20px; font-weight: 700; color: var(--color-oxford-blue); display: flex; align-items: center; gap: 8px;">
            <span>${this.selectedSituation.icon}</span> ${this.selectedSituation.name}
          </h3>
          <div>
            ${this.selectedSituation.targetLaws.map(l => `<span class="badge-law-type law" style="margin-left: 4px;">${l}</span>`).join('')}
          </div>
        </div>
        <p style="font-size: 13.5px; color: var(--text-sepia); margin-top: 6px;">
          ${this.selectedSituation.brief}
        </p>
      </div>

      <div class="roadmap-step-list">
        ${this.selectedSituation.steps.map(step => `
          <div class="roadmap-step-item">
            <div class="roadmap-step-header">
              <span class="step-badge">${step.phase}</span>
              <span class="step-title">${step.title}</span>
              <span class="badge-law-type rule">📜 ${step.relatedLaw.lawTitle} ${step.relatedLaw.articleNum}</span>
            </div>
            <p style="font-size: 14px; color: var(--text-ink-body); line-height: 1.7; margin-bottom: 8px;">
              ${step.description}
            </p>
            <ul class="step-checklist">
              ${step.checkItems.map(item => `
                <li>
                  <label class="step-check-label">
                    <input type="checkbox">
                    <span>${item}</span>
                  </label>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed var(--border-antique); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: var(--text-muted);">
          ※ 個別の届出手続きや行政庁の指導につきましては、管轄の保健所・警察署・税務署等にご確認ください。
        </span>
        <button id="btn-ask-ai-custom-situation" class="btn-royal-gold" style="font-size: 12px;">
          🤖 AI司書に個別状況を相談
        </button>
      </div>
    `;

    document.getElementById('btn-ask-ai-custom-situation')?.addEventListener('click', async () => {
      const q = prompt(`「${this.selectedSituation.name}」について、あなたの具体的なご状況や疑問を入力してください:`);
      if (q) {
        alert('第一閲覧室（AI司書対話）へご案内いたします。');
        const navTab = document.querySelector('.nav-tab[data-room="librarian"]') as HTMLElement;
        navTab?.click();
        const inputEl = document.getElementById('librarian-input') as HTMLTextAreaElement;
        if (inputEl) {
          inputEl.value = `【${this.selectedSituation.name}についてのご相談】\n${q}`;
          document.getElementById('btn-send-librarian')?.click();
        }
      }
    });
  }
}
