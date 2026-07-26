import React from 'react';
import { s } from '../lib/helpers';
import Hero from './Hero';
import TopBar from './TopBar';
import PrintArea from './PrintArea';

import WeekScreen from '../screens/WeekScreen';
import SessionScreen from '../screens/SessionScreen';
import { DatabaseScreen, DatabaseDetailScreen } from '../screens/DatabaseScreen';
import { CardioDbScreen, CardioDbDetailScreen } from '../screens/CardioDbScreen';
import ProgramScreen from '../screens/ProgramScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProgramDayScreen from '../screens/ProgramDayScreen';
import MealsScreen from '../screens/MealsScreen';
import { ArchiveScreen, ArchiveDetailScreen } from '../screens/ArchiveScreen';

import { ExerciseSheet, DbFormSheet, ProgramAddSheet, CardioAddSheet } from '../sheets/ExerciseSheets';
import QuickAdd from '../sheets/QuickAdd';
import DayMenu from '../sheets/DayMenu';
import { MealAddSheet, MealDetailSheet, SavedMealDetailSheet, NutritionExportSheet } from '../sheets/MealSheets';
import { WorkoutSettingsSheet, RpeSheet, RecoveryPrompt, RecoveryView } from '../sheets/RecoverySheets';
import { ImportConfirm, ImportLoading, Toast, TagRename, CompleteConfirm, ProfileEditSheet, SideMenu, MoveLift, SupplementsEdit } from '../sheets/MiscSheets';

import { Splash, Welcome, Tutorial, FirstLaunch, Onboarding } from '../overlays/Flows';
import WorkoutMode from '../overlays/WorkoutMode';

function Loading() {
  return (
    <div style={s('padding:12px 16px 28px; display:flex; flex-direction:column; gap:14px;')}>
      <div className="sk" style={s('height:92px; border-radius:20px;')}></div>
      <div className="sk" style={s('height:148px; border-radius:20px;')}></div>
      <div className="sk" style={s('height:220px; border-radius:20px;')}></div>
    </div>
  );
}

export default function Shell({ v }) {
  return (
    <div data-theme={v.theme} className="app-canvas" style={s("min-height:100dvh; background:var(--bg); display:flex; justify-content:center; align-items:flex-start; padding:calc(env(safe-area-inset-top) + 32px) calc(env(safe-area-inset-right) + 16px) calc(env(safe-area-inset-bottom) + 32px) calc(env(safe-area-inset-left) + 16px); font-family:'Plus Jakarta Sans',system-ui,sans-serif;")}>
      <div data-lt-phone style={s('position:relative; width:390px; max-width:100%; height:844px; display:flex; flex-direction:column; background:var(--bg); border-radius:36px; overflow:hidden; box-shadow:0 24px 60px rgba(16,24,40,.22);')}>

        <div style={s('height:max(52px, env(safe-area-inset-top)); flex:none;')}></div>

        <Hero v={v} />
        <TopBar v={v} />

        <div data-lt-scroll className="scrollable" style={s('position:relative; flex:1; overflow:auto; padding-bottom:env(safe-area-inset-bottom);')}>
          <div data-lt-ptr></div>

          {v.loading && <Loading />}
          {v.onWeek && <WeekScreen v={v} />}
          {v.onSession && <SessionScreen v={v} />}
          {v.onDatabase && <DatabaseScreen v={v} />}
          {v.onDatabaseDetail && <DatabaseDetailScreen v={v} />}
          {v.onCardioDb && <CardioDbScreen v={v} />}
          {v.onCardioDbDetail && <CardioDbDetailScreen v={v} />}
          {v.onProgram && <ProgramScreen v={v} />}
          {v.onHistory && <HistoryScreen v={v} />}
          {v.onProgramDay && <ProgramDayScreen v={v} />}
          {v.onMeals && <MealsScreen v={v} />}
          {v.onArchive && <ArchiveScreen v={v} />}
          {v.onArchiveDetail && <ArchiveDetailScreen v={v} />}
        </div>

        {/* ===== overlays & sheets ===== */}
        {v.exSheetOpen && <ExerciseSheet v={v} />}
        {v.dbFormOpen && <DbFormSheet v={v} />}
        {v.programAddOpen && <ProgramAddSheet v={v} />}
        {v.cardioAddOpen && <CardioAddSheet v={v} />}
        {v.quickAddOpen && <QuickAdd v={v} />}
        {v.supplementsEditOpen && <SupplementsEdit v={v} />}
        {v.dayMenuOpen && <DayMenu v={v} />}
        {v.mealAddOpen && <MealAddSheet v={v} />}
        {v.mealDetailOpen && <MealDetailSheet v={v} />}
        {v.savedMealDetailOpen && <SavedMealDetailSheet v={v} />}
        {v.exportOpen && <NutritionExportSheet v={v} />}
        {v.tagRenameOpen && <TagRename v={v} />}
        {v.ccOpen && <CompleteConfirm v={v} />}
        {v.woActive && <WorkoutMode v={v} />}
        {v.wsOpenFlag && <WorkoutSettingsSheet v={v} />}
        {v.rpeOpen && <RpeSheet v={v} />}
        {v.recoveryOpen && <RecoveryPrompt v={v} />}
        {v.recoveryViewOpen && <RecoveryView v={v} />}
        {v.profileEditOpen && <ProfileEditSheet v={v} />}
        {v.menuOpen && <SideMenu v={v} />}
        {v.moveOpen && <MoveLift v={v} />}

        {/* flows */}
        {v.splashActive && <Splash v={v} />}
        {v.welcomeActive && <Welcome v={v} />}
        {v.tutorialActive && <Tutorial v={v} />}
        {v.firstLaunchActive && <FirstLaunch v={v} />}
        {v.onbActive && <Onboarding v={v} />}

        {v.confirmImportOpen && <ImportConfirm v={v} />}
        {v.importingActive && <ImportLoading />}
        {v.hasToast && <Toast v={v} />}
      </div>

      <PrintArea v={v} />
    </div>
  );
}
