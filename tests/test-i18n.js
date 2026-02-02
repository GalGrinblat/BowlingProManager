/**
 * i18n (Internationalization) Test Suite
 * Tests Hebrew language support and RTL functionality
 */

import translations from '../src/translations/index.ts';

console.log('✅ Testing i18n Infrastructure\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

// Test 1: Translation files exist
console.log('\n✅ Test 1: Translation Files Loaded');
console.log('   Should have both English and Hebrew translations\n');

if (translations && translations.en && translations.he) {
  console.log('   ✓ English translations loaded');
  console.log('   ✓ Hebrew translations loaded');
  passed += 2;
} else {
  console.log('   ✗ Translation files not loaded properly');
  failed += 2;
}

// Test 2: Translation structure matches
console.log('\n✅ Test 2: Translation Structure');
console.log('   Should have matching keys between en and he\n');

const enKeys = Object.keys(translations.en);
const heKeys = Object.keys(translations.he);

const missingInHebrew = enKeys.filter(key => !heKeys.includes(key));
const missingInEnglish = heKeys.filter(key => !enKeys.includes(key));

if (missingInHebrew.length === 0 && missingInEnglish.length === 0) {
  console.log(`   ✓ All ${enKeys.length} top-level keys match`);
  passed++;
} else {
  console.log('   ✗ Key mismatch found:');
  if (missingInHebrew.length > 0) {
    console.log(`      Missing in Hebrew: ${missingInHebrew.join(', ')}`);
  }
  if (missingInEnglish.length > 0) {
    console.log(`      Missing in English: ${missingInEnglish.join(', ')}`);
  }
  failed++;
}

// Test 3: Check critical sections exist
console.log('\n✅ Test 3: Critical Translation Sections');
console.log('   Should have all required sections\n');

const requiredSections = [
  'common', 'auth', 'nav', 'players', 'leagues', 'seasons',
  'teams', 'games', 'standings', 'settings', 'dashboard'
];

const enSections = Object.keys(translations.en);
const heSections = Object.keys(translations.he);

let sectionsPass = true;
requiredSections.forEach(section => {
  if (enSections.includes(section) && heSections.includes(section)) {
    console.log(`   ✓ Section "${section}" exists in both languages`);
    passed++;
  } else {
    console.log(`   ✗ Section "${section}" missing`);
    failed++;
    sectionsPass = false;
  }
});

// Test 4: Sample translations
console.log('\n✅ Test 4: Sample Translations');
console.log('   Should have correct Hebrew translations\n');

const sampleTests = [
  { path: 'common.save', en: 'Save', he: 'שמור' },
  { path: 'auth.login', en: 'Login', he: 'התחבר' },
  { path: 'nav.dashboard', en: 'Dashboard', he: 'לוח בקרה' },
  { path: 'players.title', en: 'Player Registry', he: 'רישום שחקנים' },
];

sampleTests.forEach(test => {
  const [section, key] = test.path.split('.');
  const enValue = translations.en[section]?.[key];
  const heValue = translations.he[section]?.[key];
  
  if (enValue === test.en && heValue === test.he) {
    console.log(`   ✓ ${test.path}: en="${enValue}", he="${heValue}"`);
    passed++;
  } else {
    console.log(`   ✗ ${test.path}: Expected en="${test.en}", he="${test.he}"`);
    console.log(`      Got en="${enValue}", he="${heValue}"`);
    failed++;
  }
});

// Test 5: Hebrew characters validation
console.log('\n✅ Test 5: Hebrew Characters');
console.log('   Should contain actual Hebrew Unicode characters\n');

const hebrewRegex = /[\u0590-\u05FF]/;
const commonHeValues = Object.values(translations.he.common);
const hasHebrew = commonHeValues.some(value => hebrewRegex.test(value));

if (hasHebrew) {
  console.log('   ✓ Hebrew Unicode characters found in translations');
  passed++;
} else {
  console.log('   ✗ No Hebrew Unicode characters found');
  failed++;
}

// Test 6: No empty translations
console.log('\n✅ Test 6: Translation Completeness');
console.log('   Should not have empty strings\n');

let emptyCount = 0;
Object.keys(translations.en).forEach(section => {
  Object.keys(translations.en[section]).forEach(key => {
    if (!translations.en[section][key] || !translations.he[section][key]) {
      emptyCount++;
      console.log(`   ✗ Empty translation: ${section}.${key}`);
    }
  });
});

if (emptyCount === 0) {
  console.log('   ✓ All translations are populated');
  passed++;
} else {
  console.log(`   ✗ Found ${emptyCount} empty translations`);
  failed++;
}

// Summary
console.log('\n' + '='.repeat(80));
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(failed === 0 ? '✅ All i18n tests passed!' : '❌ Some i18n tests failed');

// Instructions for developers
console.log('\n' + '='.repeat(80));
console.log('\n📝 IMPLEMENTATION STATUS:\n');
console.log('✅ COMPLETED:');
console.log('   - LanguageContext with translation function');
console.log('   - English and Hebrew translation dictionaries');
console.log('   - RTL CSS support');
console.log('   - Organization model with language field');
console.log('   - Settings page with language selector');
console.log('   - Header, LoginView components translated');
console.log('');
console.log('🔨 TODO - Update remaining components with t() function:');
console.log('   Admin Components:');
console.log('     - AdminDashboard.jsx');
console.log('     - PlayerRegistry.jsx');
console.log('     - LeagueManagement.jsx');
console.log('     - LeagueDetail.jsx');
console.log('     - SeasonSetup.jsx');
console.log('     - SeasonDashboard.jsx');
console.log('     - SeasonGamePlayer.jsx');
console.log('     - TeamManagement.jsx');
console.log('   Player Components:');
console.log('     - PlayerDashboard.jsx');
console.log('     - PlayerSeasonComparison.jsx');
console.log('   Game Components:');
console.log('     - MatchView.jsx');
console.log('     - SummaryView.jsx');
console.log('     - GameHistoryView.jsx');
console.log('   Shared:');
console.log('     - Pagination.jsx');
console.log('');
console.log('📋 PATTERN TO FOLLOW:');
console.log('   1. Import: import { useTranslation } from \'../contexts/LanguageContext\';');
console.log('   2. Use hook: const { t } = useTranslation();');
console.log('   3. Replace strings: "Save" → {t(\'common.save\')}');
console.log('   4. Keep numbers LTR: Add className="ltr-content" to numeric displays');
console.log('   5. Test: Switch language in Settings and verify layout');
console.log('');

process.exit(failed > 0 ? 1 : 0);
