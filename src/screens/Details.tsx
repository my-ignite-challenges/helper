import { useEffect, useState } from "react";

import { useNavigation, useRoute } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import { Box, HStack, ScrollView, Text, useTheme, VStack } from "native-base";
import {
  CircleWavyCheck,
  DesktopTower,
  Hourglass,
  ClipboardText,
} from "phosphor-react-native";

import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { IssueDetailsCard } from "../components/IssueDetailsCard";
import { IssueProps } from "../components/Issue";
import { Loading } from "../components/Loading";
import { IssueFireStoreDTO } from "../DTOs/IssueFirestoreDTO";
import { formatDate } from "../utils/firestoreDateFormat";
import { Button } from "../components/Button";
import { Alert } from "react-native";

type RouteParams = {
  issueId: string;
};

type Issue = IssueProps & {
  description: string;
  solution: string;
  closing_date: string;
};

export function Details() {
  const [isLoading, setIsLoading] = useState(true);
  const [solution, setSolution] = useState("");
  const [issue, setIssue] = useState<Issue>({} as Issue);

  const route = useRoute();

  const navigation = useNavigation();

  const { issueId } = route.params as RouteParams;

  const { colors } = useTheme();

  const handleIssueClose = () => {
    if (!solution) {
      return Alert.alert(
        "Encerramento de Solicitação",
        "Informe a solução para encerrar a solicitação."
      );
    }

    firestore()
      .collection<IssueFireStoreDTO>("issues")
      .doc(issueId)
      .update({
        status: "closed",
        solution,
        closed_at: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        Alert.alert(
          "Encerramento de Solicitação",
          "Solicitação encerrado com sucesso."
        );
        navigation.navigate("Home");
      })
      .catch((error) => {
        Alert.alert("Solicitação", "Não foi possível encerrar a solicitação.");
      });
  };

  useEffect(() => {
    firestore()
      .collection<IssueFireStoreDTO>("issues")
      .doc(issueId)
      .get()
      .then((doc) => {
        const {
          patrimony,
          description,
          status,
          created_at,
          closed_at,
          solution,
        } = doc.data();

        const closing_date = closed_at ? formatDate(closed_at) : null;

        setIssue({
          id: doc.id,
          patrimony,
          description,
          status,
          solution,
          when: formatDate(created_at),
          closing_date,
        });

        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack flex={1} bg="gray.700">
      <Box px={6} bg="gray.600">
        <Header title="Solicitação" />
      </Box>

      <HStack bg="gray.500" justifyContent="center" p={4}>
        {issue.status === "closed" ? (
          <CircleWavyCheck size={22} color={colors.green[300]} />
        ) : (
          <Hourglass size={22} color={colors.secondary[700]} />
        )}

        <Text
          fontSize="sm"
          color={
            issue.status === "closed"
              ? colors.green[300]
              : colors.secondary[700]
          }
          ml={2}
          textTransform="uppercase"
        >
          {issue.status === "closed" ? "finalizada" : "em andamento"}
        </Text>
      </HStack>

      <ScrollView mx={5} showsVerticalScrollIndicator={false}>
        <IssueDetailsCard
          title="Equipamento"
          description={`Patrimônio ${issue.patrimony}`}
          icon={DesktopTower}
        />
        <IssueDetailsCard
          title="Descrição do Problema"
          description={issue.description}
          icon={ClipboardText}
          footer={`Registrado em ${issue.when}`}
        />
        <IssueDetailsCard
          title="Solução"
          icon={CircleWavyCheck}
          description={issue.solution}
          footer={issue.closing_date && `Encerrado em ${issue.closing_date}`}
        >
          {issue.status === "open" && (
            <Input
              placeholder="Descrição da solução"
              onChangeText={setSolution}
              h={24}
              textAlignVertical="top"
              multiline
            />
          )}
        </IssueDetailsCard>
      </ScrollView>

      {issue.status === "open" && (
        <Button title="Encerrar solicitação" onPress={handleIssueClose} m={5} />
      )}
    </VStack>
  );
}
