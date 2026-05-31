import JSZip from 'jszip';
import { PracticeRecord, saveRecord } from './db';

export async function exportRecordsAsZip(records: PracticeRecord[]): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('VoicePractice')!;
  const audioFolder = folder.folder('audio')!;

  const exportData = records.map((r) => {
    const { audioBlob, ...rest } = r;
    const audioPath = `audio/${r.id}.webm`;
    return { ...rest, audioPath };
  });

  folder.file('records.json', JSON.stringify(exportData, null, 2));

  for (const record of records) {
    if (record.audioBlob) {
      audioFolder.file(`${record.id}.webm`, record.audioBlob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VoicePractice_${new Date().toISOString().split('T')[0]}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importRecordsFromZip(file: File): Promise<number> {
  const zip = await JSZip.loadAsync(file);
  const jsonFile = zip.file('VoicePractice/records.json');
  if (!jsonFile) throw new Error('找不到 records.json，請確認 ZIP 格式正確。');

  const jsonText = await jsonFile.async('text');
  const records: (Omit<PracticeRecord, 'audioBlob'> & { audioPath?: string })[] = JSON.parse(jsonText);

  let count = 0;
  for (const r of records) {
    let audioBlob: Blob | undefined;
    if (r.audioPath) {
      const audioFile = zip.file(`VoicePractice/${r.audioPath}`);
      if (audioFile) {
        const arrayBuffer = await audioFile.async('arraybuffer');
        audioBlob = new Blob([arrayBuffer], { type: 'audio/webm' });
      }
    }
    const { audioPath, ...rest } = r as typeof r & { audioPath?: string };
    await saveRecord({ ...rest, audioBlob });
    count++;
  }
  return count;
}
