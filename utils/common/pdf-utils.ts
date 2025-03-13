import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ComparisonResult,
  ComparisonStatistics,
  DiffResult,
  FileType,
  FSUSubType,
} from "@/types/teaching.types";

// Dosya adından klasör yolunu ve dosya adını ayırma
const extractPathAndName = (
  fullPath: string
): { path: string; name: string } => {
  const parts = fullPath.split(/[\/\\]/);
  const name = parts.pop() || fullPath;
  const path = parts.join("/");
  return { path, name };
};

// PDF rapor oluşturma fonksiyonu
export const generateComparisonReport = (
  comparisonResult: ComparisonResult,
  fileType: FileType | FSUSubType,
  typeName: string,
  folder1Name?: string,
  folder2Name?: string
): jsPDF => {
  const doc = new jsPDF();
  const { file1Name, file2Name, statistics, differences, comparisonDate } =
    comparisonResult;
  const currentDate = new Date().toLocaleString();

  // Dosya yollarını ve adlarını ayır
  const file1Info = extractPathAndName(file1Name);
  const file2Info = extractPathAndName(file2Name);

  // Dosya adları aynı mı kontrol et
  const sameFileName = file1Info.name === file2Info.name;

  // Başlık
  doc.setFontSize(18);
  doc.text(`File Comparison Report - ${typeName}`, 14, 20);

  // Tarih
  doc.setFontSize(10);
  doc.text(`Creation Date: ${currentDate}`, 14, 30);

  // Yönetici Özeti (Executive Summary)
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text("Executive Summary", 14, 40);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  // Özet metni oluştur
  const totalChanges = statistics.addedLines + statistics.removedLines;
  const changePercentage = Math.round(
    (totalChanges / statistics.totalLines) * 100
  );
  const similarityText =
    statistics.similarityPercentage >= 90
      ? "very similar"
      : statistics.similarityPercentage >= 70
      ? "mostly similar"
      : statistics.similarityPercentage >= 50
      ? "moderately different"
      : "significantly different";

  const summaryLines = [
    `This report compares ${file1Info.name} and ${file2Info.name} files between`,
    folder1Name && folder2Name
      ? `${folder1Name} and ${folder2Name} folders.`
      : "two different sources.",
    `The files are ${similarityText} with ${statistics.similarityPercentage}% similarity.`,
    `Total of ${totalChanges} changes (${changePercentage}% of content) were detected,`,
    `including ${statistics.addedLines} additions and ${statistics.removedLines} removals.`,
  ];

  let yPos = 45;
  summaryLines.forEach((line) => {
    doc.text(line, 14, yPos);
    yPos += 5;
  });

  // Görsel grafik - Benzerlik göstergesi
  const gaugeStartY = yPos + 5;
  doc.setFontSize(12);
  doc.text("Similarity Gauge:", 14, gaugeStartY);

  // Gösterge çerçevesi
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(14, gaugeStartY + 5, 100, 10);

  // Benzerlik yüzdesi için dolgu
  doc.setFillColor(
    statistics.similarityPercentage < 50
      ? 220
      : statistics.similarityPercentage < 70
      ? 240
      : 120,
    statistics.similarityPercentage < 50
      ? 53
      : statistics.similarityPercentage < 70
      ? 150
      : 220,
    statistics.similarityPercentage < 50
      ? 69
      : statistics.similarityPercentage < 70
      ? 50
      : 50
  );
  doc.rect(14, gaugeStartY + 5, statistics.similarityPercentage, 10, "F");

  // Yüzde etiketleri
  doc.setFontSize(8);
  doc.text("0%", 14, gaugeStartY + 20);
  doc.text("50%", 64, gaugeStartY + 20);
  doc.text("100%", 114, gaugeStartY + 20);

  // Benzerlik yüzdesi
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`${statistics.similarityPercentage}%`, 118, gaugeStartY + 10);

  // Değişiklik dağılımı pasta grafiği
  const pieStartY = gaugeStartY + 25;
  doc.setFontSize(12);
  doc.text("Change Distribution:", 14, pieStartY);

  // Pasta grafiği yerine basit bir çubuk grafik çizelim (jsPDF'de doğrudan pasta grafiği yok)
  const barStartX = 14;
  const barWidth = 100;
  const barHeight = 10;
  const barY = pieStartY + 5;

  // Değişmeyen satırlar (gri)
  const unchangedWidth =
    (statistics.unchangedLines / statistics.totalLines) * barWidth;
  doc.setFillColor(200, 200, 200);
  doc.rect(barStartX, barY, unchangedWidth, barHeight, "F");

  // Eklenen satırlar (yeşil)
  const addedWidth = (statistics.addedLines / statistics.totalLines) * barWidth;
  doc.setFillColor(40, 167, 69);
  doc.rect(barStartX + unchangedWidth, barY, addedWidth, barHeight, "F");

  // Silinen satırlar (kırmızı)
  const removedWidth =
    (statistics.removedLines / statistics.totalLines) * barWidth;
  doc.setFillColor(220, 53, 69);
  doc.rect(
    barStartX + unchangedWidth + addedWidth,
    barY,
    removedWidth,
    barHeight,
    "F"
  );

  // Grafik açıklaması
  doc.setFontSize(8);
  doc.setFillColor(200, 200, 200);
  doc.rect(14, barY + 15, 5, 5, "F");
  doc.text("Unchanged", 22, barY + 19);

  doc.setFillColor(40, 167, 69);
  doc.rect(64, barY + 15, 5, 5, "F");
  doc.text("Added", 72, barY + 19);

  doc.setFillColor(220, 53, 69);
  doc.rect(104, barY + 15, 5, 5, "F");
  doc.text("Removed", 112, barY + 19);

  // Dosya bilgileri
  const fileInfoStartY = barY + 30;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  // Klasör ve dosya bilgilerini daha anlamlı bir şekilde göster
  if (folder1Name && folder2Name) {
    // Klasör isimleri varsa, onları kullan
    doc.text(`Source Folder: ${folder1Name}`, 14, fileInfoStartY);
    doc.text(`Target Folder: ${folder2Name}`, 14, fileInfoStartY + 8);

    // Dosya isimleri
    doc.text(`File 1: ${file1Info.name}`, 14, fileInfoStartY + 16);
    doc.text(`File 2: ${file2Info.name}`, 14, fileInfoStartY + 24);

    // İstatistikler tablosu için Y pozisyonunu ayarla
    var statsStartY = fileInfoStartY + 32;
  } else if (sameFileName) {
    // Dosya adları aynıysa
    doc.text(`File: ${file1Info.name}`, 14, fileInfoStartY);
    doc.setFontSize(10);
    doc.text(
      `Folder 1: ${folder1Name || file1Info.path || "Root Directory"}`,
      20,
      fileInfoStartY + 8
    );
    doc.text(
      `Folder 2: ${folder2Name || file2Info.path || "Root Directory"}`,
      20,
      fileInfoStartY + 16
    );

    // Dosya zaman bilgisi varsa göster
    if (
      file1Name.match(/\d{4}[-\/]\d{2}[-\/]\d{2}/) ||
      file2Name.match(/\d{4}[-\/]\d{2}[-\/]\d{2}/)
    ) {
      doc.text(
        "Note: Files may have different timestamps or versions",
        20,
        fileInfoStartY + 24
      );
    }

    // İstatistikler tablosu için Y pozisyonunu ayarla
    var statsStartY = fileInfoStartY + 32;
  } else {
    // Farklı dosya adları
    const file1DisplayName = folder1Name ? `${file1Info.name}` : file1Name;
    const file2DisplayName = folder2Name ? `${file2Info.name}` : file2Name;

    doc.text(`File 1: ${file1DisplayName}`, 14, fileInfoStartY);
    doc.text(`File 2: ${file2DisplayName}`, 14, fileInfoStartY + 8);

    // İstatistikler tablosu için Y pozisyonunu ayarla
    var statsStartY = fileInfoStartY + 16;
  }

  // İstatistikler tablosu
  autoTable(doc, {
    startY: statsStartY,
    head: [["Statistics", "Value"]],
    body: [
      ["Total Lines", statistics.totalLines.toString()],
      ["Added Lines", statistics.addedLines.toString()],
      ["Removed Lines", statistics.removedLines.toString()],
      ["Modified Lines", statistics.modifiedLines.toString()],
      ["Unchanged Lines", statistics.unchangedLines.toString()],
      ["Similarity Percentage", `${statistics.similarityPercentage}%`],
    ],
    headStyles: { fillColor: [41, 128, 185] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  // Değişiklik önem derecesi analizi
  const currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text("Change Impact Analysis", 14, currentY);
  doc.setTextColor(0, 0, 0);

  // Değişiklik önem derecesini belirle
  let impactLevel = "Low";
  let impactColor = [40, 167, 69]; // Yeşil
  let impactDescription = "Minor changes with minimal impact on functionality.";

  if (statistics.similarityPercentage < 50) {
    impactLevel = "Critical";
    impactColor = [220, 53, 69]; // Kırmızı
    impactDescription = "Major changes that significantly alter functionality.";
  } else if (statistics.similarityPercentage < 70) {
    impactLevel = "High";
    impactColor = [255, 193, 7]; // Sarı
    impactDescription = "Substantial changes that may affect functionality.";
  } else if (statistics.similarityPercentage < 90) {
    impactLevel = "Medium";
    impactColor = [0, 123, 255]; // Mavi
    impactDescription =
      "Moderate changes with potential impact on some functions.";
  }

  // Önem derecesi tablosu
  autoTable(doc, {
    startY: currentY + 5,
    head: [["Impact Level", "Description", "Recommendation"]],
    body: [
      [
        {
          content: impactLevel,
          styles: {
            fillColor: impactColor as [number, number, number],
            textColor: [255, 255, 255],
          },
        },
        impactDescription,
        getRecommendation(impactLevel, fileType),
      ],
    ],
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 80 },
      2: { cellWidth: 80 },
    },
  });

  // Değişiklik özeti
  if (statistics.addedLines > 0 || statistics.removedLines > 0) {
    const currentY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Changes Summary", 14, currentY2);
    doc.setTextColor(0, 0, 0);

    // Dosya isimlerini kısaltmak için yardımcı fonksiyon
    const getShortFileName = (fileName: string) => {
      const info = extractPathAndName(fileName);
      return info.name;
    };

    const file1ShortName = getShortFileName(file1Name);
    const file2ShortName = getShortFileName(file2Name);

    // Değişiklik özeti tablosu
    autoTable(doc, {
      startY: currentY2 + 5,
      head: [["Change Type", "Count", "Details"]],
      body: [
        [
          "Added Lines",
          statistics.addedLines.toString(),
          folder1Name && folder2Name
            ? `Lines added in ${folder2Name} (${file2ShortName})`
            : sameFileName
            ? `Lines added in the second file`
            : `Lines added to ${file2ShortName}`,
        ],
        [
          "Removed Lines",
          statistics.removedLines.toString(),
          folder1Name && folder2Name
            ? `Lines removed from ${folder1Name} (${file1ShortName})`
            : sameFileName
            ? `Lines removed from the first file`
            : `Lines removed from ${file1ShortName}`,
        ],
      ],
      headStyles: { fillColor: [41, 128, 185] },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    // Detaylı değişiklik tablosu
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Detailed Changes", 14, 20);

    // Eklenen ve silinen satırları takip etmek için diziler
    const addedRows: string[][] = [];
    const removedRows: string[][] = [];

    // Satır numaralarını takip etmek için değişkenler
    let file1LineNumber = 1;
    let file2LineNumber = 1;

    // Değişiklikleri işle
    differences.forEach((diff) => {
      const lines = diff.value.split("\n");

      // Boş satırları atla (son satır genellikle boş olur)
      const validLines = lines.filter((line) => line.length > 0);

      if (validLines.length === 0) return;

      if (diff.added) {
        // Eklenen satırlar için
        validLines.forEach((line) => {
          addedRows.push([
            file2LineNumber.toString(),
            line,
            sameFileName
              ? `${file2Info.path || "Folder 2"}/${file2Info.name}`
              : file2Name,
          ]);
          file2LineNumber++;
        });
      } else if (diff.removed) {
        // Silinen satırlar için
        validLines.forEach((line) => {
          removedRows.push([
            file1LineNumber.toString(),
            line,
            sameFileName
              ? `${file1Info.path || "Folder 1"}/${file1Info.name}`
              : file1Name,
          ]);
          file1LineNumber++;
        });
      } else {
        // Değişmeyen satırlar için sadece satır numaralarını güncelle
        file1LineNumber += validLines.length;
        file2LineNumber += validLines.length;
      }
    });

    // Silinen satırlar tablosu
    if (removedRows.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69); // Kırmızı renk

      if (folder1Name && folder2Name) {
        doc.text(`Removed Lines (from ${folder1Name})`, 14, 30);
      } else if (sameFileName) {
        doc.text(`Removed Lines (from first file)`, 14, 30);
      } else {
        doc.text(`Removed Lines (from ${file1ShortName})`, 14, 30);
      }

      doc.setTextColor(0, 0, 0); // Siyah renge geri dön

      autoTable(doc, {
        startY: 35,
        head: [["Line #", "Content", "Source"]],
        body: removedRows.map((row) => [
          row[0],
          row[1],
          folder1Name ? `${folder1Name}/${file1ShortName}` : row[2],
        ]),
        headStyles: { fillColor: [220, 53, 69] },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [255, 240, 240] },
        styles: { overflow: "linebreak", cellWidth: "auto" },
        columnStyles: {
          0: { cellWidth: 30 },
          2: { cellWidth: 60 },
        },
      });
    }

    // Eklenen satırlar tablosu
    if (addedRows.length > 0) {
      const startY =
        removedRows.length > 0 ? (doc as any).lastAutoTable.finalY + 15 : 35;

      // Eğer önceki tablo sayfanın çoğunu kapladıysa yeni sayfa ekle
      if (startY > 200) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(40, 167, 69); // Yeşil renk

        if (folder1Name && folder2Name) {
          doc.text(`Added Lines (to ${folder2Name})`, 14, 20);
        } else if (sameFileName) {
          doc.text(`Added Lines (to second file)`, 14, 20);
        } else {
          doc.text(`Added Lines (to ${file2ShortName})`, 14, 20);
        }

        doc.setTextColor(0, 0, 0); // Siyah renge geri dön

        autoTable(doc, {
          startY: 25,
          head: [["Line #", "Content", "Source"]],
          body: addedRows.map((row) => [
            row[0],
            row[1],
            folder2Name ? `${folder2Name}/${file2ShortName}` : row[2],
          ]),
          headStyles: { fillColor: [40, 167, 69] },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [240, 255, 240] },
          styles: { overflow: "linebreak", cellWidth: "auto" },
          columnStyles: {
            0: { cellWidth: 30 },
            2: { cellWidth: 60 },
          },
        });
      } else {
        doc.setFontSize(14);
        doc.setTextColor(40, 167, 69); // Yeşil renk

        if (folder1Name && folder2Name) {
          doc.text(`Added Lines (to ${folder2Name})`, 14, startY);
        } else if (sameFileName) {
          doc.text(`Added Lines (to second file)`, 14, startY);
        } else {
          doc.text(`Added Lines (to ${file2ShortName})`, 14, startY);
        }

        doc.setTextColor(0, 0, 0); // Siyah renge geri dön

        autoTable(doc, {
          startY: startY + 5,
          head: [["Line #", "Content", "Source"]],
          body: addedRows.map((row) => [
            row[0],
            row[1],
            folder2Name ? `${folder2Name}/${file2ShortName}` : row[2],
          ]),
          headStyles: { fillColor: [40, 167, 69] },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [240, 255, 240] },
          styles: { overflow: "linebreak", cellWidth: "auto" },
          columnStyles: {
            0: { cellWidth: 30 },
            2: { cellWidth: 60 },
          },
        });
      }
    }

    // Toplam değişiklik sayısı
    const totalChanges = addedRows.length + removedRows.length;
    const currentY3 = (doc as any).lastAutoTable.finalY + 10;

    if (currentY3 < 270) {
      // Sayfanın altına yakın değilse
      doc.setFontSize(10);
      doc.text(`Total changes: ${totalChanges} lines`, 14, currentY3);
    }
  } else {
    // Eğer değişiklik yoksa bilgi ver
    const currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text("No differences found between the files.", 14, currentY);
  }

  // Önemli değişiklik örnekleri sayfası ekle
  if (statistics.addedLines > 0 || statistics.removedLines > 0) {
    doc.addPage();

    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text("Key Changes Examples", 14, 20);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(12);
    doc.text(
      "Below are examples of the most significant changes detected:",
      14,
      35
    );

    let exampleYPos = 45;
    let exampleCount = 0;
    const maxExamples = 5;

    // Dosya isimlerini al
    const exampleFile1Name = extractPathAndName(file1Name).name;
    const exampleFile2Name = extractPathAndName(file2Name).name;

    // Önemli değişiklik örnekleri
    for (const diff of differences) {
      if (exampleCount >= maxExamples) break;

      if (diff.added || diff.removed) {
        const lines = diff.value.split("\n");
        // Boş satırları atla
        const validLines = lines.filter((line) => line.trim().length > 0);

        if (validLines.length === 0) continue;

        // Sadece ilk satırı göster
        const sampleLine =
          validLines[0].length > 80
            ? validLines[0].substring(0, 80) + "..."
            : validLines[0];

        doc.setFontSize(10);

        if (diff.added) {
          doc.setTextColor(40, 167, 69); // Yeşil
          doc.text(`+ Added in ${exampleFile2Name}:`, 14, exampleYPos);
        } else {
          doc.setTextColor(220, 53, 69); // Kırmızı
          doc.text(`- Removed from ${exampleFile1Name}:`, 14, exampleYPos);
        }

        exampleYPos += 6;
        doc.setTextColor(0, 0, 0);
        doc.text(`   ${sampleLine}`, 14, exampleYPos);

        if (validLines.length > 1) {
          exampleYPos += 6;
          doc.setTextColor(100, 100, 100);
          doc.text(
            `   ... and ${validLines.length - 1} more line(s)`,
            14,
            exampleYPos
          );
        }

        exampleYPos += 10;
        exampleCount++;
      }
    }

    if (exampleCount === 0) {
      doc.text(
        "No significant changes found to display as examples.",
        14,
        exampleYPos
      );
    }

    // Tam Karşılaştırma Sayfası
    doc.addPage();

    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text("Side-by-Side Comparison", 14, 20);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(10);
    doc.text(
      "Below is the complete side-by-side comparison of both files:",
      14,
      30
    );

    // Dosya başlıkları
    const comparisonFile1Name = extractPathAndName(file1Name).name;
    const comparisonFile2Name = extractPathAndName(file2Name).name;

    doc.setFillColor(240, 240, 240);
    doc.rect(14, 35, 85, 10, "F");
    doc.rect(105, 35, 85, 10, "F");

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Klasör isimleri varsa göster
    if (folder1Name && folder2Name) {
      doc.text(`${folder1Name} / ${comparisonFile1Name}`, 56, 41, {
        align: "center",
      });
      doc.text(`${folder2Name} / ${comparisonFile2Name}`, 147, 41, {
        align: "center",
      });
    } else {
      doc.text(comparisonFile1Name, 56, 41, { align: "center" });
      doc.text(comparisonFile2Name, 147, 41, { align: "center" });
    }

    // Dosya içeriklerini yan yana göster
    let comparisonYPos = 50;
    const lineHeight = 6;
    const maxLinesPerPage = 35;
    let lineCount = 0;

    // Dosya içeriklerini satır satır karşılaştır
    const file1Lines = getFileLines(differences, false); // removed veya unchanged
    const file2Lines = getFileLines(differences, true); // added veya unchanged

    const totalLines = Math.max(file1Lines.length, file2Lines.length);
    let currentLine = 0;

    while (currentLine < totalLines) {
      // Sayfa doluysa yeni sayfa ekle
      if (lineCount >= maxLinesPerPage) {
        doc.addPage();
        comparisonYPos = 20;
        lineCount = 0;

        // Yeni sayfada başlıkları tekrar göster
        doc.setFillColor(240, 240, 240);
        doc.rect(14, comparisonYPos, 85, 10, "F");
        doc.rect(105, comparisonYPos, 85, 10, "F");

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        if (folder1Name && folder2Name) {
          doc.text(
            `${folder1Name} / ${comparisonFile1Name}`,
            56,
            comparisonYPos + 6,
            { align: "center" }
          );
          doc.text(
            `${folder2Name} / ${comparisonFile2Name}`,
            147,
            comparisonYPos + 6,
            { align: "center" }
          );
        } else {
          doc.text(comparisonFile1Name, 56, comparisonYPos + 6, {
            align: "center",
          });
          doc.text(comparisonFile2Name, 147, comparisonYPos + 6, {
            align: "center",
          });
        }

        comparisonYPos += 15;
      }

      // Satır numarası
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`${currentLine + 1}`, 10, comparisonYPos + 4);
      doc.text(`${currentLine + 1}`, 101, comparisonYPos + 4);

      // Sol dosya satırı
      if (currentLine < file1Lines.length) {
        const line1 = file1Lines[currentLine];

        // Arka plan rengi (silinen satırlar için açık kırmızı)
        if (line1.removed) {
          doc.setFillColor(255, 200, 200);
          doc.rect(14, comparisonYPos, 85, lineHeight, "F");
        }

        // Satır içeriği
        doc.setFontSize(8);
        doc.setTextColor(line1.removed ? 220 : 0, 0, 0);

        // Satırı kısalt
        const displayText1 =
          line1.text.length > 40
            ? line1.text.substring(0, 40) + "..."
            : line1.text;
        doc.text(displayText1, 16, comparisonYPos + 4);
      }

      // Sağ dosya satırı
      if (currentLine < file2Lines.length) {
        const line2 = file2Lines[currentLine];

        // Arka plan rengi (eklenen satırlar için açık yeşil)
        if (line2.added) {
          doc.setFillColor(200, 255, 200);
          doc.rect(105, comparisonYPos, 85, lineHeight, "F");
        }

        // Satır içeriği
        doc.setFontSize(8);
        doc.setTextColor(0, line2.added ? 150 : 0, 0);

        // Satırı kısalt
        const displayText2 =
          line2.text.length > 40
            ? line2.text.substring(0, 40) + "..."
            : line2.text;
        doc.text(displayText2, 107, comparisonYPos + 4);
      }

      comparisonYPos += lineHeight;
      lineCount++;
      currentLine++;
    }
  }

  // Sayfa numarası ekle
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return doc;
};

// PDF'i indirme fonksiyonu
export const downloadPDF = (doc: jsPDF, fileName: string): void => {
  doc.save(fileName);
};

// Karşılaştırma sonucundan PDF oluşturup indirme
export const generateAndDownloadReport = (
  comparisonResult: ComparisonResult,
  fileType: FileType | FSUSubType,
  typeName: string,
  folder1Name?: string,
  folder2Name?: string
): void => {
  const doc = generateComparisonReport(
    comparisonResult,
    fileType,
    typeName,
    folder1Name,
    folder2Name
  );

  // Dosya adını daha anlamlı hale getir
  let fileName = "";

  // Dosya adını oluştur
  if (folder1Name && folder2Name) {
    // Klasör isimlerini kullan
    // Tarih formatını YYYY-MM-DD_HH-MM şeklinde oluştur
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
    fileName = `${folder1Name}_vs_${folder2Name}_${typeName}_${formattedDate}.pdf`;
  } else {
    // Dosya tipini kullan
    // Tarih formatını YYYY-MM-DD_HH-MM şeklinde oluştur
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
    fileName = `analysis_${fileType}_${formattedDate}.pdf`;
  }

  // Dosya adındaki boşlukları ve özel karakterleri temizle
  fileName = fileName.replace(/\s+/g, "_").replace(/[^\w.-]/g, "_");

  downloadPDF(doc, fileName);
};

// Önem derecesine göre tavsiye oluşturan yardımcı fonksiyon
function getRecommendation(
  impactLevel: string,
  fileType: FileType | FSUSubType
): string {
  switch (impactLevel) {
    case "Critical":
      return "Thorough testing required. Consider reviewing all changes manually before implementation.";
    case "High":
      return "Detailed testing recommended. Pay attention to core functionality changes.";
    case "Medium":
      return "Standard testing advised. Verify key functions are working as expected.";
    case "Low":
      return "Minimal testing needed. Changes are unlikely to affect system behavior.";
    default:
      return "Standard testing recommended.";
  }
}

// Dosya içeriğini satır satır almak için yardımcı fonksiyon
function getFileLines(
  differences: DiffResult[],
  isSecondFile: boolean
): { text: string; added?: boolean; removed?: boolean }[] {
  const lines: { text: string; added?: boolean; removed?: boolean }[] = [];

  differences.forEach((diff) => {
    if (
      (isSecondFile && diff.added) ||
      (!isSecondFile && diff.removed) ||
      (!diff.added && !diff.removed)
    ) {
      const diffLines = diff.value.split("\n");

      diffLines.forEach((line) => {
        if (line.trim() !== "") {
          lines.push({
            text: line,
            added: diff.added,
            removed: diff.removed,
          });
        }
      });
    }
  });

  return lines;
}

// Parametre değişikliklerini analiz eden yardımcı fonksiyon
function analyzeParameterChanges(differences: DiffResult[]): string[] {
  const changes: string[] = [];

  // Parametre değişikliklerini bul
  const parameterPattern = /OT#\((\d+)\)/g;
  const oldParams: { [key: string]: string } = {};
  const newParams: { [key: string]: string } = {};

  differences.forEach((diff) => {
    let match;
    while ((match = parameterPattern.exec(diff.value)) !== null) {
      if (diff.removed) {
        oldParams[match[1]] = match[0];
      } else if (diff.added) {
        newParams[match[1]] = match[0];
      }
    }
  });

  // Değişen parametreleri belirle
  for (const oldKey in oldParams) {
    if (!newParams[oldKey]) {
      changes.push(`Parameter ${oldParams[oldKey]} has been removed`);
    }
  }

  for (const newKey in newParams) {
    if (!oldParams[newKey]) {
      changes.push(`Parameter ${newParams[newKey]} has been added`);
    } else if (oldParams[newKey] !== newParams[newKey]) {
      changes.push(
        `Parameter changed from ${oldParams[newKey]} to ${newParams[newKey]}`
      );
    }
  }

  // Eğer değişiklik yoksa veya çok fazla değişiklik varsa
  if (changes.length === 0) {
    // Genel değişiklik açıklamaları ekle
    if (
      Object.keys(oldParams).length > 0 ||
      Object.keys(newParams).length > 0
    ) {
      changes.push("Parameter values have been updated");
    }
  } else if (changes.length > 5) {
    // Çok fazla değişiklik varsa özet göster
    changes.splice(
      0,
      changes.length,
      `Multiple parameter changes detected (${changes.length} changes)`,
      "Review the side-by-side comparison for details"
    );
  }

  return changes;
}

// Operasyonel etkileri belirleyen yardımcı fonksiyon
function getOperationalImpacts(
  fileType: FileType | FSUSubType,
  statistics: ComparisonStatistics
): string[] {
  const impacts: string[] = [];

  // Değişiklik oranına göre etki belirle
  const changeRatio =
    (statistics.addedLines + statistics.removedLines) / statistics.totalLines;

  if (changeRatio > 0.5) {
    impacts.push(
      "Major changes detected - significant operational impact expected"
    );
    impacts.push("Comprehensive testing and operator training recommended");
  } else if (changeRatio > 0.2) {
    impacts.push(
      "Moderate changes detected - some operational adjustments may be needed"
    );
    impacts.push("Testing of affected functions recommended");
  } else {
    impacts.push(
      "Minor changes detected - minimal operational impact expected"
    );
  }

  // Dosya tipine göre özel etkiler
  switch (fileType) {
    case FileType.JOB:
      impacts.push(
        "Changes to job files may affect robot movement patterns and sequences"
      );
      if (statistics.addedLines > statistics.removedLines) {
        impacts.push("New functionality has been added to the job");
      }
      break;
    case FileType.LADDER:
      impacts.push(
        "Changes to ladder logic may affect control system behavior"
      );
      break;
    case FileType.TOOL:
      impacts.push(
        "Tool configuration changes may affect precision and calibration"
      );
      break;
    case FileType.VARIABLE:
      impacts.push(
        "Variable changes may affect system behavior across multiple jobs"
      );
      break;
  }

  return impacts;
}
