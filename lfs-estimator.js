/*!
 * LFS Estimator Tool
 * Instant fire sprinkler installation cost estimator, embeddable via <script>.
 * For London Fire Sprinklers (https://londonfiresprinklers.com/).
 *
 * Embed:
 *   <div data-lfs-estimator></div>
 *   <script src="lfs-estimator.js"></script>
 *
 * Optional per-instance overrides via data attributes on the container:
 *   data-title="Custom heading"
 *   data-contact-url="https://londonfiresprinklers.com/contact"
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // PRICING CONFIG — PLACEHOLDER RATES.
  // These figures are illustrative only. Replace with London Fire
  // Sprinklers' real day rates / material costs before this goes live
  // on the client's site.
  // ---------------------------------------------------------------------
  var PRICING_CONFIG = {
    baseRatePerSqm: {
      residential: 45,
      commercial: 55,
      warehouse: 35,
      mixed: 50
    },
    perExtraFloorMultiplier: 0.08, // +8% per floor above the first, for riser/pipework complexity
    minimumProjectFee: 2500, // floor for any estimate, in GBP
    rangeLowFactor: 0.9,
    rangeHighFactor: 1.25
  };

  var PROPERTY_TYPE_LABELS = {
    residential: 'Residential',
    commercial: 'Commercial / Retail',
    warehouse: 'Warehouse / Industrial',
    mixed: 'Mixed-use / Other'
  };

  var ROLE_LABELS = {
    homeowner: 'Homeowner — protecting my own home or family',
    architect: 'Architect — specifying for a client’s design',
    builder: 'Builder / Developer — pricing or building a project',
    other: 'Something else — not sure yet, just exploring'
  };

  var DEFAULT_TITLE = 'Get an instant fire sprinkler quote';
  var DEFAULT_CONTACT_URL = 'https://londonfiresprinklers.com/contact';
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var instanceCount = 0;

  function formatGBP(value) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(value);
  }

  function calculateEstimate(propertyType, areaSqm, floors) {
    var baseRate = PRICING_CONFIG.baseRatePerSqm[propertyType];
    var floorMultiplier = 1 + Math.max(0, floors - 1) * PRICING_CONFIG.perExtraFloorMultiplier;
    var subtotal = baseRate * areaSqm * floorMultiplier;
    var low = Math.max(PRICING_CONFIG.minimumProjectFee, subtotal * PRICING_CONFIG.rangeLowFactor);
    var high = Math.max(low, subtotal * PRICING_CONFIG.rangeHighFactor);
    return { low: low, high: high };
  }

  function injectStyles() {
    if (document.getElementById('lfs-estimator-styles')) return;
    var style = document.createElement('style');
    style.id = 'lfs-estimator-styles';
    style.textContent =
      '@import url(\'https://fonts.googleapis.com/css2?family=Mukta:wght@200;600&family=Lato:wght@400;700&display=swap\');' +
      '.lfs-estimator{--lfs-ink:#050505;--lfs-red:#EA1B1B;--lfs-bg:#ffffff;--lfs-radius:10px;' +
      'box-sizing:border-box;max-width:420px;width:100%;padding:24px;background:var(--lfs-bg);' +
      'border:1px solid var(--lfs-ink);border-radius:var(--lfs-radius);' +
      'font-family:"Lato",Helvetica,Arial,sans-serif;font-weight:400;' +
      'color:var(--lfs-ink);}' +
      '.lfs-estimator *{box-sizing:border-box;}' +
      '.lfs-estimator__title{margin:0 0 16px;font-family:"Mukta",sans-serif;font-weight:200;' +
      'font-size:1.5rem;line-height:1.3;color:var(--lfs-ink);}' +
      '.lfs-estimator__field{margin-bottom:14px;}' +
      '.lfs-estimator__field label{display:block;margin-bottom:6px;font-size:0.9rem;font-weight:700;}' +
      '.lfs-estimator__field select,.lfs-estimator__field input{width:100%;padding:10px 12px;' +
      'font-family:"Lato",Helvetica,Arial,sans-serif;font-size:1rem;border:1px solid var(--lfs-ink);' +
      'border-radius:6px;background:#fff;color:var(--lfs-ink);}' +
      '.lfs-estimator__field select:focus,.lfs-estimator__field input:focus{outline:2px solid var(--lfs-red);outline-offset:1px;}' +
      '.lfs-estimator__submit{width:100%;padding:12px 16px;font-family:"Lato",Helvetica,Arial,sans-serif;' +
      'font-size:1rem;font-weight:700;color:#fff;' +
      'background:var(--lfs-red);border:none;border-radius:6px;cursor:pointer;transition:background .15s ease;}' +
      '.lfs-estimator__submit:hover{background:var(--lfs-ink);}' +
      '.lfs-estimator__result{margin-top:18px;padding:16px;border:1px solid var(--lfs-ink);border-radius:8px;text-align:center;}' +
      '.lfs-estimator__result--error{border-color:var(--lfs-red);color:var(--lfs-red);font-size:0.9rem;}' +
      '.lfs-estimator__price{margin:0;font-family:"Mukta",sans-serif;font-weight:200;font-size:1.6rem;color:var(--lfs-red);}' +
      '.lfs-estimator__price-caption{margin:4px 0 12px;font-size:0.85rem;color:var(--lfs-ink);}' +
      '.lfs-estimator__cta{display:inline-block;padding:10px 18px;font-size:0.9rem;font-weight:700;' +
      'color:#fff;background:var(--lfs-ink);border-radius:6px;text-decoration:none;}' +
      '.lfs-estimator__cta:hover{background:var(--lfs-red);}' +
      '.lfs-estimator__disclaimer{margin:14px 0 0;font-size:0.75rem;line-height:1.4;color:var(--lfs-ink);}';
    document.head.appendChild(style);
  }

  function buildForm(container) {
    instanceCount += 1;
    var idPrefix = 'lfs-est-' + instanceCount;
    var title = container.dataset.title || DEFAULT_TITLE;
    var contactUrl = container.dataset.contactUrl || DEFAULT_CONTACT_URL;

    var typeOptions = Object.keys(PROPERTY_TYPE_LABELS)
      .map(function (key) {
        return '<option value="' + key + '">' + PROPERTY_TYPE_LABELS[key] + '</option>';
      })
      .join('');

    var roleOptions = Object.keys(ROLE_LABELS)
      .map(function (key) {
        return '<option value="' + key + '">' + ROLE_LABELS[key] + '</option>';
      })
      .join('');

    container.innerHTML =
      '<form class="lfs-estimator" novalidate>' +
        '<h3 class="lfs-estimator__title">' + title + '</h3>' +
        '<div class="lfs-estimator__field">' +
          '<label for="' + idPrefix + '-role">Which best describes you?</label>' +
          '<select id="' + idPrefix + '-role" name="role" required>' +
            '<option value="" disabled selected>Select an option</option>' +
            roleOptions +
          '</select>' +
        '</div>' +
        '<div class="lfs-estimator__field">' +
          '<label for="' + idPrefix + '-type">Property type</label>' +
          '<select id="' + idPrefix + '-type" name="propertyType" required>' +
            '<option value="" disabled selected>Select property type</option>' +
            typeOptions +
          '</select>' +
        '</div>' +
        '<div class="lfs-estimator__field">' +
          '<label for="' + idPrefix + '-address">Property address</label>' +
          '<input type="text" id="' + idPrefix + '-address" name="address" autocomplete="street-address" required>' +
        '</div>' +
        '<div class="lfs-estimator__field">' +
          '<label for="' + idPrefix + '-area">Total floor area (m&sup2;)</label>' +
          '<input type="number" id="' + idPrefix + '-area" name="area" min="1" step="1" inputmode="numeric" required>' +
        '</div>' +
        '<div class="lfs-estimator__field">' +
          '<label for="' + idPrefix + '-floors">Number of floors</label>' +
          '<input type="number" id="' + idPrefix + '-floors" name="floors" min="1" step="1" value="1" inputmode="numeric" required>' +
        '</div>' +
        '<div class="lfs-estimator__field">' +
          '<label for="' + idPrefix + '-email">Email address</label>' +
          '<input type="email" id="' + idPrefix + '-email" name="email" autocomplete="email" required>' +
        '</div>' +
        '<div class="lfs-estimator__field">' +
          '<label for="' + idPrefix + '-phone">Phone number (optional)</label>' +
          '<input type="tel" id="' + idPrefix + '-phone" name="phone" autocomplete="tel">' +
        '</div>' +
        '<button type="submit" class="lfs-estimator__submit">Get instant estimate</button>' +
        '<div class="lfs-estimator__result" aria-live="polite" hidden></div>' +
        '<p class="lfs-estimator__disclaimer">' +
          'This is an instant, indicative estimate only &mdash; not a fixed quote. ' +
          'Final pricing depends on a full site survey.' +
        '</p>' +
      '</form>';

    var form = container.querySelector('form');
    var resultEl = container.querySelector('.lfs-estimator__result');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var role = form.role.value;
      var propertyType = form.propertyType.value;
      var address = form.address.value.trim();
      var area = parseFloat(form.area.value);
      var floors = parseInt(form.floors.value, 10);
      var email = form.email.value.trim();

      var isValid = role && propertyType && address && area > 0 && floors > 0 &&
        EMAIL_PATTERN.test(email);

      if (!isValid) {
        resultEl.hidden = false;
        resultEl.className = 'lfs-estimator__result lfs-estimator__result--error';
        resultEl.textContent = 'Please fill in every required field with a valid value.';
        return;
      }

      var estimate = calculateEstimate(propertyType, area, floors);

      resultEl.hidden = false;
      resultEl.className = 'lfs-estimator__result lfs-estimator__result--success';
      resultEl.innerHTML =
        '<p class="lfs-estimator__price">' + formatGBP(estimate.low) + ' &ndash; ' + formatGBP(estimate.high) + '</p>' +
        '<p class="lfs-estimator__price-caption">Estimated installation cost</p>' +
        '<a class="lfs-estimator__cta" href="' + contactUrl + '">Request a full survey &amp; fixed quote</a>';
    });
  }

  function init(selector) {
    injectStyles();
    var containers = document.querySelectorAll(selector || '[data-lfs-estimator]');
    containers.forEach(buildForm);
  }

  function autoInit() {
    if (document.querySelector('[data-lfs-estimator]')) {
      init();
    }
  }

  window.LFSEstimator = { init: init, calculateEstimate: calculateEstimate };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
