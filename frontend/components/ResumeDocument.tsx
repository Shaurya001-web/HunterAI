"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: '30pt 40pt',
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.3,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  contact: {
    fontSize: 10,
  },
  section: {
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '1px solid black',
    paddingBottom: 2,
    marginBottom: 6,
  },
  bold: {
    fontFamily: 'Times-Bold',
    fontWeight: 'bold',
  },
  italic: {
    fontFamily: 'Times-Italic',
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 15,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
  }
});

interface ResumeDocumentProps {
  data: any; 
}

export const ResumeDocument = ({ data }: ResumeDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.name || 'SHAURYA MISHRA'}</Text>
        <Text style={styles.contact}>
          Prayagraj, Uttar Pradesh, India | +91 77558 98628 | mishrashaurya2008@gmail.com
        </Text>
        <Text style={styles.contact}>
          LinkedIn | GitHub | LeetCode
        </Text>
      </View>

      {/* Career Objective */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Career Objective</Text>
        <Text>Execution-focused Computer Science and Engineering student specializing in AI/ML and Full-Stack development. Possesses hands-on technical expertise building multi-agent AI systems, production-style backend APIs, structured data pipelines, and NLP classifiers. Proficient in Next.js, FastAPI, Supabase, and machine learning frameworks. Seeking an engineering internship to contribute to active repositories and deploy scalable software solutions.</Text>
      </View>

      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education && data.education.length > 0 ? data.education.map((edu: any, i: number) => (
          <View key={i} style={{ marginBottom: 4 }}>
            <View style={styles.row}>
              <Text style={styles.bold}>{edu.degree || edu.institution}</Text>
              <Text>{edu.year}</Text>
            </View>
            <View style={styles.row}>
              <Text>{edu.degree ? edu.institution : ''}</Text>
              <Text>{edu.gpa ? `GPA: ${edu.gpa}` : ''}</Text>
            </View>
          </View>
        )) : (
          <>
            <View style={{ marginBottom: 4 }}>
              <View style={styles.row}>
                <Text style={styles.bold}>Bachelor of Engineering in Computer Science &amp; Engineering (AI &amp; ML)</Text>
                <Text>(2025--2029)</Text>
              </View>
              <View style={styles.row}>
                <Text>Chandigarh University, Mohali, Punjab</Text>
                <Text>SGPA: 7.63 / 10.0</Text>
              </View>
            </View>
            <View style={{ marginBottom: 4 }}>
              <View style={styles.row}>
                <Text style={styles.bold}>Senior Secondary Education (Class XII) — CBSE Board</Text>
                <Text>(2024--2025)</Text>
              </View>
              <View style={styles.row}>
                <Text>Sadhguru Public Hr. Secondary School, Uttar Pradesh</Text>
                <Text>Percentage: 73%</Text>
              </View>
            </View>
            <View style={{ marginBottom: 4 }}>
              <View style={styles.row}>
                <Text style={styles.bold}>Secondary Education (Class X) — CBSE Board</Text>
                <Text>(2022--2023)</Text>
              </View>
              <View style={styles.row}>
                <Text>Sadhguru Public Hr. Secondary School, Uttar Pradesh</Text>
                <Text>Percentage: 86%</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.map((proj: any, i: number) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <View style={styles.row}>
                <Text style={styles.bold}>{proj.title}</Text>
              </View>
              {proj.technologies && (
                <Text style={styles.italic}>Tech Stack: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</Text>
              )}
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{proj.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text><Text style={styles.bold}>Technical Skills: </Text>{data.skills.join(', ')}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map((exp: any, i: number) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <View style={styles.row}>
                <Text style={styles.bold}>{exp.role}</Text>
                <Text>{exp.company}</Text>
              </View>
              {exp.duration && <Text style={styles.italic}>{exp.duration}</Text>}
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{exp.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>Selected for the Data Science / AI Engineer internship selection track at Unessa Foundation through a competitive profile screening on Internshala (May 2026).</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>Contributed to an open-source Google Summer of Code (GSoC) organization repository by submitting a verified pull request.</Text>
        </View>
      </View>

      {/* Certifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Microsoft Certified: Azure AI Fundamentals (AI-900) — Microsoft</Text></View>
        <View style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Programming Foundations with JavaScript, HTML and CSS — Duke University</Text></View>
        <View style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Introduction to Artificial Intelligence — Intel Corporation</Text></View>
        <View style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Generative Artificial Intelligence — LinkedIn</Text></View>
      </View>

    </Page>
  </Document>
);
