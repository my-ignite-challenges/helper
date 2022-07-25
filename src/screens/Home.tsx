import React, { useEffect, useState } from "react";

import { Alert } from "react-native";

import {
  VStack,
  HStack,
  IconButton,
  useTheme,
  Text,
  Heading,
  FlatList,
  Center,
} from "native-base";
import { ChatTeardropText, SignOut } from "phosphor-react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";

import Logo from "../assets/logo_secondary.svg";
import { Button } from "../components/Button";
import { Filter } from "../components/Filter";
import { Issue, IssueProps } from "../components/Issue";
import { Loading } from "../components/Loading";
import { formatDate } from "../utils/firestoreDateFormat";

enum FilterLabel {
  open = "open",
  closed = "closed",
}

type SelectedFilter = keyof typeof FilterLabel;

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>(
    FilterLabel.open
  );
  const [issues, setIssues] = useState<IssueProps[]>([]);

  const { colors } = useTheme();

  const navigation = useNavigation();

  const handleLogout = () => {
    auth()
      .signOut()
      .catch((error) => {
        return Alert.alert(
          "Autenticação",
          "Não foi possível realizar o logout."
        );
      });
  };

  useEffect(() => {
    setIsLoading(true);

    const fetchIssuesSubscriber = firestore()
      .collection("issues")
      .where("status", "==", selectedFilter)
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const { patrimony, description, status, created_at } = doc.data();

          return {
            id: doc.id,
            patrimony,
            description,
            status,
            when: formatDate(created_at),
          };
        });
        setIssues(data);
        setIsLoading(false);
      });

    return fetchIssuesSubscriber;
  }, [selectedFilter]);

  return (
    <VStack flex={1} pb={6} bg="gray.700">
      <HStack
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        bg="gray.700"
        pt={12}
        pb={5}
        px={6}
      >
        <Logo />
        <IconButton
          icon={<SignOut size={26} color={colors.gray[300]} />}
          onPress={handleLogout}
        />
      </HStack>

      <VStack flex={1} px={6}>
        <HStack
          w="full"
          mt={8}
          mb={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading color="gray.100">Solicitações</Heading>
          <Text color="gray.200">{issues.length}</Text>
        </HStack>
        <HStack space={3} mb={8}>
          <Filter
            type="open"
            title="em andamento"
            onPress={() => setSelectedFilter("open")}
            isActive={selectedFilter === FilterLabel.open}
          />
          <Filter
            type="closed"
            title="finalizados"
            onPress={() => setSelectedFilter("closed")}
            isActive={selectedFilter === FilterLabel.closed}
          />
        </HStack>

        {isLoading ? (
          <Loading />
        ) : (
          <FlatList
            data={issues}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Issue
                data={item}
                onPress={() =>
                  navigation.navigate("Details", { issueId: item.id })
                }
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
            ListEmptyComponent={() => (
              <Center>
                <ChatTeardropText color={colors.gray[300]} size={40} />
                <Text color="gray.300" fontSize="xl" mt={6} textAlign="center">
                  Você ainda não possui {"\n"}
                  solicitações{" "}
                  {selectedFilter === "open" ? "em andamento" : "finalizadas"}
                </Text>
              </Center>
            )}
          />
        )}

        <Button
          title="Nova solicitação"
          onPress={() => navigation.navigate("Register")}
        />
      </VStack>
    </VStack>
  );
}
