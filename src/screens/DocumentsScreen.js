import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PrimaryButton} from '../components/PrimaryButton';
import {Screen} from '../components/Screen';
import {GlassCard} from '../components/GlassCard';
import {useAppStore} from '../store/useAppStore';
import {colors, typography} from '../theme';
import {formatRelative} from '../utils/format';

export function DocumentsScreen() {
  const navigation = useNavigation();
  const [question, setQuestion] = useState('');
  const documents = useAppStore((state) => state.documents);
  const ragLoading = useAppStore((state) => state.ragLoading);
  const chatLoading = useAppStore((state) => state.chatLoading);
  const ingestPickedDocument = useAppStore((state) => state.ingestPickedDocument);
  const removeDocument = useAppStore((state) => state.removeDocument);
  const askWithRag = useAppStore((state) => state.askWithRag);
  const notice = useAppStore((state) => state.notice);
  const globalError = useAppStore((state) => state.globalError);

  const ask = async () => {
    if (!question.trim()) {
      return;
    }
    await askWithRag(question.trim());
    setQuestion('');
    navigation.navigate('Chat');
  };

  return (
    <Screen scroll>
      <SafeAreaView edges={['top']}>
        <Text style={styles.kicker}>Retrieval</Text>
        <Text style={styles.title}>Knowledge</Text>
        <Text style={styles.body}>
          Upload a note. Aura embeds it with OpenAI, keeps the slices close, and
          retrieves the most relevant passages before answering.
        </Text>

        <PrimaryButton
          label="Upload a document"
          onPress={ingestPickedDocument}
          loading={ragLoading}
        />

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {globalError ? <Text style={styles.error}>{globalError}</Text> : null}

        <GlassCard style={styles.askBox}>
          <Text style={styles.section}>Ask the library</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="What does this document say about auth?"
            placeholderTextColor={colors.textDim}
            style={styles.input}
            multiline
          />
          <PrimaryButton
            label="Ask with RAG"
            onPress={ask}
            loading={chatLoading}
            disabled={!documents.length || !question.trim()}
          />
        </GlassCard>

        <Text style={styles.section}>Indexed files</Text>
        {documents.length === 0 ? (
          <Text style={styles.empty}>
            Nothing catalogued yet. A .txt or .md file is enough.
          </Text>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={styles.card}>
              <View style={styles.mark}>
                <Text style={styles.markText}>▣</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.meta}>
                  {doc.chunkCount} slices · {formatRelative(doc.createdAt)}
                </Text>
              </View>
              <Pressable onPress={() => removeDocument(doc.id)}>
                <Text style={styles.delete}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.caption,
    color: colors.accent,
  },
  title: {
    ...typography.display,
    marginTop: 4,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 22,
    marginVertical: 12,
  },
  notice: {
    color: colors.accent,
    marginTop: 10,
  },
  error: {
    color: colors.danger,
    marginTop: 10,
  },
  askBox: {
    marginTop: 18,
    gap: 12,
  },
  section: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  input: {
    minHeight: 88,
    backgroundColor: colors.bgInput,
    color: colors.text,
    borderRadius: 16,
    padding: 12,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: {
    color: colors.textDim,
  },
  card: {
    backgroundColor: 'rgba(16,12,28,0.8)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: colors.accent,
  },
  flex: {
    flex: 1,
  },
  docTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  meta: {
    color: colors.textDim,
    marginTop: 4,
    fontSize: 12,
  },
  delete: {
    color: colors.rose,
    fontWeight: '700',
  },
});
