"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 15,
    borderBottom: '1px solid #000',
    paddingBottom: 2,
    fontWeight: 'bold',
  },
  bulletPoint: {
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  }
});

interface ResumeDocumentProps {
  data: any; // TailoredProfile data
}

export const ResumeDocument = ({ data }: ResumeDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View>
        <Text style={styles.header}>{data.name || 'Candidate Name'}</Text>
      </View>

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Skills</Text>
          <Text style={styles.bulletPoint}>{data.skills.join(', ')}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Experience</Text>
          {data.experience.map((exp: any, i: number) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{exp.role} | {exp.company}</Text>
                {exp.duration && <Text style={{ fontSize: 10 }}>{exp.duration}</Text>}
              </View>
              <Text style={styles.bulletPoint}>• {exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Projects</Text>
          {data.projects.map((proj: any, i: number) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{proj.title}</Text>
                {proj.technologies && (
                  <Text style={{ fontSize: 10 }}>{Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</Text>
                )}
              </View>
              <Text style={styles.bulletPoint}>• {proj.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Education</Text>
          {data.education.map((edu: any, i: number) => (
            <View key={i} style={{ marginBottom: 5 }}>
              <View style={styles.row}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{edu.institution}</Text>
                {edu.year && <Text style={{ fontSize: 10 }}>{edu.year}</Text>}
              </View>
              <Text style={styles.bulletPoint}>{edu.degree}</Text>
            </View>
          ))}
        </View>
      )}

    </Page>
  </Document>
);
