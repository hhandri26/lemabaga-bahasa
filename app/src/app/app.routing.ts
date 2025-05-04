import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    {path: '', pathMatch : 'full', redirectTo: 'dashboard'},

    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'dashboard'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            // {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
        ]
    },

    // Landing routes
    // {
    //     path: '',
    //     component  : LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children   : [
    //         {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
    //     ]
    // },

    // Admin routes
    {
        path       : '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [
            { path: 'dashboard', loadChildren: () => import('app/modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'profil', loadChildren: () => import('app/modules/profil/profil.module').then(m => m.ProfilModule) },
            { path: 'penerjemah', loadChildren: () => import('app/modules/penerjemah/penerjemah.module').then(m => m.PenerjemahModule) },

            { path: 'undangan-kegiatan', loadChildren: () => import('app/modules/undangan-kegiatan/undangan-kegiatan.module').then(m => m.UndanganKegiatanModule) },
            { path: 'undangan', loadChildren: () => import('app/modules/undangan-kegiatan-user/undangan-kegiatan-user.module').then(m => m.UndanganKegiatanUserModule) },

            { path: 'verifikasi-riwayat', loadChildren: () => import('app/modules/verifikasi/verifikasi-riwayat/verifikasi-riwayat.module').then(m => m.VerifikasiRiwayatModule) },
            { path: 'verifikasi-formasi', loadChildren: () => import('app/modules/formasi/formasi.module').then(m => m.FormasiModule) },
            { path: 'verifikasi-pengangkatan', loadChildren: () => import('app/modules/pengangkatan/pengangkatan.module').then(m => m.PengangkatanModule) },

            { path: 'agenda', loadChildren: () => import('app/modules/agenda/agenda.module').then(m => m.AgendaModule) },
            { path: 'diklat', loadChildren: () => import('app/modules/diklat/diklat.module').then(m => m.DiklatModule) },
            { path: 'forum', loadChildren: () => import('app/modules/forum/forum.module').then(m => m.ForumModule) },
            // { path: 'kuis', loadChildren: () => import('app/modules/kuis/kuis.module').then(m => m.KuisModule) },
            { path: 'quiz', loadChildren: () => import('app/modules/quiz/quiz.module').then(m => m.QuizModule) },
            { path: 'kuisoner', loadChildren: () => import('app/modules/kuisoner/kuisoner.module').then(m => m.KuisonerModule) },
            
            { path: 'konseling', loadChildren: () => import('app/modules/konseling/konseling.module').then(m => m.KonselingModule) },
            { path: 'survey-kuisoner', loadChildren: () => import('app/modules/survey-kuisoner/survey-kuisoner.module').then(m => m.SurveyKuisonerModule) },

            { path: 'survey', loadChildren: () => import('app/modules/survey/survey.module').then(m => m.SurveyModule) },
            { path: 'survey-user', loadChildren: () => import('app/modules/survey-user/survey-user.module').then(m => m.SurveyUserModule) },
            { path: 'survey-user-kuisoner', loadChildren: () => import('app/modules/survey-user-kuisoner/survey-user-kuisoner.module').then(m => m.SurveyKuisonerUserModule) },

            { path: 'rekapitulasi-monev', loadChildren: () => import('app/modules/rekapitulasi/rekapitulasi-monev/rekapitulasi-monev.module').then(m => m.RekapitulasiMonevModule) },
            { path: 'rekapitulasi-formasi', loadChildren: () => import('app/modules/rekapitulasi/rekapitulasi-formasi/rekapitulasi-formasi.module').then(m => m.RekapitulasiFormasiModule) },
            { path: 'rekapitulasi-angka-kredit', loadChildren: () => import('app/modules/rekapitulasi/rekapitulasi-angka-kredit/rekapitulasi-angka-kredit.module').then(m => m.RekapitulasiAngkaKreditModule) },

            { path: 'pengguna', loadChildren: () => import('app/modules/users/users.module').then(m => m.UsersModule) },

            { path: 'referensi-instansi', loadChildren: () => import('app/modules/referensi/instansi/instansi.module').then(m => m.InstansiModule) },
            { path: 'referensi-pendidikan', loadChildren: () => import('app/modules/referensi/pendidikan/pendidikan.module').then(m => m.PendidikanModule) },
            { path: 'referensi-bahasa', loadChildren: () => import('app/modules/referensi/bahasa/bahasa.module').then(m => m.BahasaModule) },
            { path: 'referensi-jenis-sertifikat', loadChildren: () => import('app/modules/referensi/jenis-sertifikat/jenis-sertifikat.module').then(m => m.JenisSertifikatModule) },
            { path: 'referensi-pelatihan', loadChildren: () => import('app/modules/referensi/pelatihan/pelatihan.module').then(m => m.PelatihanModule) },
            { path: 'referensi-kegiatan-translasi', loadChildren: () => import('app/modules/referensi/jenis-kegiatan-translasi/jenis-kegiatan-translasi.module').then(m => m.JenisKegiatanTranslasiModule) },
            { path: 'referensi-satuan-organisasi', loadChildren: () => import('app/modules/referensi/satuan-organisasi/satuan-organisasi.module').then(m => m.SatuanOrganisasiModule) },
            { path: 'referensi-bobot', loadChildren: () => import('app/modules/referensi/bobot/bobot.module').then(m => m.BobotModule) },
            { path: 'referensi-dokumen', loadChildren: () => import('app/modules/referensi/dokumen/dokumen.module').then(m => m.DokumenModule) },
            { path: 'referensi-diklat-kelompok', loadChildren: () => import('app/modules/referensi/diklat-group/diklat-group.module').then(m => m.DiklatGroupModule) },
            { path: 'referensi-diklat-tema', loadChildren: () => import('app/modules/referensi/diklat-topik/diklat-topik.module').then(m => m.DiklatTopikModule) },
            { path: 'referensi-tipe-survei', loadChildren: () => import('app/modules/referensi/tipe-survey/tipe-survei.module').then(m => m.TipeSurveiModule) },

            { path: 'formasi', loadChildren: () => import('app/modules/formasi/formasi.module').then(m => m.FormasiModule) },
            { path: 'pengangkatan', loadChildren: () => import('app/modules/pengangkatan/pengangkatan.module').then(m => m.PengangkatanModule) },

            { path: 'profile', loadChildren: () => import('app/modules/settings/settings.module').then(m => m.SettingsModule) },
        ]
    }
];
