import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import { getProperties } from '../storage/propertyStorage';
import { Property, TimeEntry } from '../types/property';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useNavigation } from '@react-navigation/native';

type PeriodMode = 'MONTH' | 'YEAR';

const pad2 = (n: number) => n.toString().padStart(2, '0');
const isoToday = () => new Date().toISOString().split('T')[0];

const parseISODateUTC = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, day ?? 1));
};

const fmtMin = (min: number) => {
  if (!min || min < 0) return '0 Min';
  if (min < 60) return `${min} Min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} m`;
};

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm} Uhr`;
};

const monthName = (m0: number) =>
  ['Januar','Februar','Maerz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'][m0];

const getMonthBoundsUTC = (y: number, m0: number) => {
  const start = new Date(Date.UTC(y, m0, 1));
  const end = new Date(Date.UTC(y, m0 + 1, 0, 23, 59, 59, 999));
  return { start, end };
};

const getYearBoundsUTC = (y: number) => {
  const start = new Date(Date.UTC(y, 0, 1));
  const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
  return { start, end };
};

const inRange = (e: TimeEntry, start: Date, end: Date) => {
  if (!e.date) return false;
  const d = parseISODateUTC(e.date);
  return d >= start && d <= end;
};

const escapeHtml = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string)
  );

export default function DashboardScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [mode, setMode] = useState<PeriodMode>('MONTH');
  const today = useMemo(isoToday, []);
  const [year, setYear] = useState<number>(new Date().getUTCFullYear());
  const [month0, setMonth0] = useState<number>(new Date().getUTCMonth()); // 0..11
  const navigation = useNavigation();

  useEffect(() => {
    const load = async () => {
      const loaded = await getProperties();
      const normalized = loaded.map(p => ({
        ...p,
        timeEntries: Array.isArray(p.timeEntries) ? p.timeEntries : [],
      }));
      setProperties(normalized);
    };
    const unsub = navigation.addListener?.('focus', load);
    load();
    return () => { if (unsub) unsub(); };
  }, [navigation]);

  const range = useMemo(
    () => (mode === 'MONTH' ? getMonthBoundsUTC(year, month0) : getYearBoundsUTC(year)),
    [mode, year, month0]
  );

  // Summen je Liegenschaft (nur abgeschlossene Einträge)
  const totalsByProperty = useMemo(() => {
    return properties
      .map(p => {
        let total = 0;
        for (const e of p.timeEntries) {
          if (e.duration === null) continue; // laufend nicht zählen
          if (inRange(e, range.start, range.end)) total += e.duration;
        }
        return { id: p.id, name: p.name, totalMinutes: total };
      })
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [properties, range]);

  // Gesamt-PDF (Summen über alle Liegenschaften)
  const exportPDFSummaryAll = async () => {
    const periodLabel = mode === 'MONTH' ? `${monthName(month0)} ${year}` : `Jahr ${year}`;

    const rowsHtml = totalsByProperty.map(r => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${r.totalMinutes}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(fmtMin(r.totalMinutes))}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head><meta charset="UTF-8" /><title>Smartime Report</title></head>
        <body style="font-family: Arial, sans-serif; color:#0f1c2e;">
          <h1 style="font-size:20px;">Smartime – Summenreport</h1>
          <div style="margin-bottom:10px;">Zeitraum: <strong>${escapeHtml(periodLabel)}</strong></div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;">Liegenschaft</th>
                <th style="text-align:right;padding:8px;border-bottom:1px solid #ccc;">Minuten</th>
                <th style="text-align:right;padding:8px;border-bottom:1px solid #ccc;">Formatiert</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="3" style="padding:8px;">Keine Daten</td></tr>`}
            </tbody>
          </table>
          <div style="margin-top:14px;font-size:10px;color:#666;">Erstellt am ${escapeHtml(today)}</div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e: any) {
      Alert.alert('Fehler beim PDF-Export', e?.message ?? String(e));
    }
  };

  // PDF NUR für EINE Liegenschaft (Detailtabelle + Summe im Zeitraum)
  const exportPDFForProperty = async (prop: Property) => {
    const periodLabel = mode === 'MONTH' ? `${monthName(month0)} ${year}` : `Jahr ${year}`;
    // Filter & Summen
    const filtered = (prop.timeEntries || []).filter(e => inRange(e, range.start, range.end));
    const totalMinutes = filtered.reduce((acc, e) => acc + (e.duration ?? 0), 0);

    const detailRows = filtered
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
      .map(e => `
        <tr>
          <td style="padding:6px;border-bottom:1px solid #eee;">${escapeHtml(e.date || '')}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${escapeHtml(e.startTime ? fmtTime(e.startTime) : '')}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${e.endTime ? escapeHtml(fmtTime(e.endTime)) : 'läuft'}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${e.duration !== null ? e.duration : ''}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${e.duration !== null ? escapeHtml(fmtMin(e.duration)) : ''}</td>
        </tr>
      `).join('');

    const html = `
      <html>
        <head><meta charset="UTF-8" /><title>Smartime Report – ${escapeHtml(prop.name)}</title></head>
        <body style="font-family: Arial, sans-serif; color:#0f1c2e;">
          <h1 style="font-size:20px;">Smartime – Report für ${escapeHtml(prop.name)}</h1>
          <div style="margin-bottom:6px;">Zeitraum: <strong>${escapeHtml(periodLabel)}</strong></div>
          <div style="margin-bottom:12px;">Adresse: ${escapeHtml(prop.street)} ${escapeHtml(prop.houseNumber)}, ${escapeHtml(prop.city)}</div>

          <h2 style="font-size:16px;margin:10px 0 6px 0;">Zusammenfassung</h2>
          <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px;">
            <tr>
              <td style="padding:6px;border:1px solid #e6e6e6;">Gesamt-Minuten</td>
              <td style="padding:6px;border:1px solid #e6e6e6;text-align:right;">${totalMinutes}</td>
            </tr>
            <tr>
              <td style="padding:6px;border:1px solid #e6e6e6;">Formatiert</td>
              <td style="padding:6px;border:1px solid #e6e6e6;text-align:right;">${escapeHtml(fmtMin(totalMinutes))}</td>
            </tr>
            <tr>
              <td style="padding:6px;border:1px solid #e6e6e6;">Einträge gesamt</td>
              <td style="padding:6px;border:1px solid #e6e6e6;text-align:right;">${filtered.length}</td>
            </tr>
          </table>

          <h2 style="font-size:16px;margin:10px 0 6px 0;">Details</h2>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc;">Datum</th>
                <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc;">Start</th>
                <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc;">Ende</th>
                <th style="text-align:right;padding:6px;border-bottom:1px solid #ccc;">Min</th>
                <th style="text-align:right;padding:6px;border-bottom:1px solid #ccc;">Format</th>
              </tr>
            </thead>
            <tbody>
              ${detailRows || `<tr><td colspan="5" style="padding:6px;">Keine Daten im Zeitraum</td></tr>`}
            </tbody>
          </table>

          <div style="margin-top:14px;font-size:10px;color:#666;">Erstellt am ${escapeHtml(today)}</div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e: any) {
      Alert.alert('Fehler beim PDF-Export', e?.message ?? String(e));
    }
  };

  const prev = () => {
    if (mode === 'MONTH') {
      if (month0 === 0) { setMonth0(11); setYear(y => y - 1); }
      else setMonth0(m => m - 1);
    } else {
      setYear(y => y - 1);
    }
  };
  const next = () => {
    if (mode === 'MONTH') {
      if (month0 === 11) { setMonth0(0); setYear(y => y + 1); }
      else setMonth0(m => m + 1);
    } else {
      setYear(y => y + 1);
    }
  };

  return (
    <View style={styles.screen}>
      <TopBar title="Reports" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Modus-Umschalter */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            onPress={() => setMode('MONTH')}
            style={[styles.modeBtn, mode === 'MONTH' && styles.modeBtnActive]}
          >
            <Text style={[styles.modeText, mode === 'MONTH' && styles.modeTextActive]}>Monat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('YEAR')}
            style={[styles.modeBtn, mode === 'YEAR' && styles.modeBtnActive]}
          >
            <Text style={[styles.modeText, mode === 'YEAR' && styles.modeTextActive]}>Jahr</Text>
          </TouchableOpacity>
        </View>

        {/* Zeitraum-Steuerung */}
        <View style={styles.periodRow}>
          <TouchableOpacity onPress={prev} style={styles.navPill}><Text style={styles.navText}>‹</Text></TouchableOpacity>
          <Text style={styles.periodLabel}>
            {mode === 'MONTH' ? `${monthName(month0)} ${year}` : `Jahr ${year}`}
          </Text>
          <TouchableOpacity onPress={next} style={styles.navPill}><Text style={styles.navText}>›</Text></TouchableOpacity>
        </View>

        {/* Summenliste mit per-Property PDF-Button */}
        <View style={styles.tableWrap}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, {flex:3}]}>Liegenschaft</Text>
            <Text style={[styles.th, {flex:1, textAlign:'right'}]}>Min</Text>
            <Text style={[styles.th, {flex:1, textAlign:'right'}]}>Format</Text>
            <Text style={[styles.th, {width: 70, textAlign:'center'}]}>PDF</Text>
          </View>
          {totalsByProperty.length === 0 ? (
            <Text style={styles.empty}>Keine Daten im gewaehlten Zeitraum.</Text>
          ) : (
            totalsByProperty.map(row => {
              const prop = properties.find(p => p.id === row.id)!;
              return (
                <View key={row.id} style={styles.tr}>
                  <Text style={[styles.td, {flex:3}]} numberOfLines={1}>{row.name}</Text>
                  <Text style={[styles.td, {flex:1, textAlign:'right'}]}>{row.totalMinutes}</Text>
                  <Text style={[styles.td, {flex:1, textAlign:'right'}]}>{fmtMin(row.totalMinutes)}</Text>
                  <View style={{width:70, alignItems:'center'}}>
                    <TouchableOpacity
                      onPress={() => exportPDFForProperty(prop)}
                      style={[styles.btnSmall, styles.btnSmallPrimary]}
                      accessibilityLabel={`PDF Report fuer ${row.name} erstellen`}
                    >
                      <Text style={styles.btnSmallText}>PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Gesamt-Export */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={exportPDFSummaryAll} style={[styles.btn, styles.btnPrimary]}>
            <Text style={styles.btnTextPrimary}>PDF (Summen – alle)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 24 },

  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cfd6de',
    backgroundColor: '#ffffff',
  },
  modeBtnActive: {
    backgroundColor: '#0f1c2e',
    borderColor: '#0f1c2e',
  },
  modeText: {
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 14,
  },
  modeTextActive: {
    color: '#00D4FF',
  },

  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  navPill: {
    backgroundColor: '#0f1c2e',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#182a42',
  },
  navText: {
    color: '#00D4FF',
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 16,
  },
  periodLabel: {
    color: '#0f1c2e',
    fontSize: 16,
    fontFamily: 'Rajdhani_600SemiBold',
  },

  tableWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    marginTop: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f7f8fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  th: {
    color: '#687385',
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 12,
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  td: {
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_400Regular',
    fontSize: 13,
  },
  empty: {
    color: '#687385',
    fontStyle: 'italic',
    padding: 10,
    fontFamily: 'Rajdhani_400Regular',
  },

  actions: {
    gap: 10,
    marginTop: 14,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: '#00D4FF',
    borderColor: '#00BDE3',
  },
  btnTextPrimary: {
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 16,
  },

  btnSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  btnSmallPrimary: {
    backgroundColor: '#00D4FF',
    borderColor: '#00BDE3',
  },
  btnSmallText: {
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 12.5,
  },
});













