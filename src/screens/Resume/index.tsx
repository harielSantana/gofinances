import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VictoryPie } from "victory-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "styled-components";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ptBR } from "date-fns/locale";
import { addMonths, subMonths, format } from "date-fns";

import { HistoryCard } from "../../components/HistoryCard";
import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer,
} from "./styles";
import { categories } from "../../utils/categories";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

interface TransactionData {
  type: "positive" | "negative";
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

const mockdata = [
  {
    id: 1,
    first_name: "Hilly",
    last_name: "Moloney",
    email: "hmoloney0@wiley.com",
    gender: "Male",
    ip_address: "183.202.85.245",
  },
  {
    id: 2,
    first_name: "Rourke",
    last_name: "Maltman",
    email: "rmaltman1@acquirethisname.com",
    gender: "Female",
    ip_address: "205.39.200.29",
  },
  {
    id: 3,
    first_name: "Rockey",
    last_name: "Dockray",
    email: "rdockray2@barnesandnoble.com",
    gender: "Male",
    ip_address: "152.105.69.243",
  },
  {
    id: 4,
    first_name: "Jaymee",
    last_name: "Hadaway",
    email: "jhadaway3@hp.com",
    gender: "Male",
    ip_address: "91.20.79.63",
  },
  {
    id: 5,
    first_name: "Billi",
    last_name: "Marskell",
    email: "bmarskell4@alexa.com",
    gender: "Male",
    ip_address: "182.21.174.112",
  },
  {
    id: 6,
    first_name: "Parke",
    last_name: "Arnke",
    email: "parnke5@issuu.com",
    gender: "Female",
    ip_address: "157.22.142.162",
  },
  {
    id: 7,
    first_name: "Judie",
    last_name: "MacAughtrie",
    email: "jmacaughtrie6@storify.com",
    gender: "Male",
    ip_address: "131.240.245.155",
  },
  {
    id: 8,
    first_name: "Harwilll",
    last_name: "Latey",
    email: "hlatey7@bluehost.com",
    gender: "Male",
    ip_address: "203.58.182.151",
  },
  {
    id: 9,
    first_name: "Hettie",
    last_name: "Tomsa",
    email: "htomsa8@stanford.edu",
    gender: "Female",
    ip_address: "123.231.250.208",
  },
  {
    id: 10,
    first_name: "Lindi",
    last_name: "Skahill",
    email: "lskahill9@ihg.com",
    gender: "Male",
    ip_address: "18.189.7.154",
  },
];

export function Resume() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>(
    []
  );

  const theme = useTheme();

  function handleDateChange(action: "next" | "prev") {
    if (action === "next") {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function loadData() {
    setIsLoading(true);
    const dataKey = "@gofinances:transactions";
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter(
      (expensive: TransactionData) =>
        expensive.type === "negative" &&
        new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
    );

    const expensivesTotal = expensives.reduce(
      (accumulator: number, expensive: TransactionData) => {
        return accumulator + Number(expensive.amount);
      },
      0
    );

    const totalByCategory: CategoryData[] = [];

    categories.forEach((category) => {
      let categorySum = 0;

      expensives.forEach((expensive: TransactionData) => {
        if (expensive.category === category.key) {
          categorySum += Number(expensive.amount);
        }
      });
      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        const percent = `${((categorySum / expensivesTotal) * 100).toFixed(
          0
        )}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted,
          percent,
        });
      }
    });
    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>

      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </LoadContainer>
      ) : (
        <Content
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: useBottomTabBarHeight(),
          }}
        >
          <MonthSelect>
            <MonthSelectButton onPress={() => handleDateChange("prev")}>
              <MonthSelectIcon name="chevron-left" />
            </MonthSelectButton>

            <Month>
              {format(selectedDate, "MMMM, yyyy", { locale: ptBR })}
            </Month>

            <MonthSelectButton onPress={() => handleDateChange("next")}>
              <MonthSelectIcon name="chevron-right" />
            </MonthSelectButton>
          </MonthSelect>
          <ChartContainer>
            <VictoryPie
              data={totalByCategories}
              y={"total"}
              x={"percent"}
              colorScale={totalByCategories.map((category) => category.color)}
              labelRadius={100}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: "bold",
                  fill: theme.colors.shape,
                },
              }}
            />
          </ChartContainer>
          {totalByCategories.map((item) => (
            <HistoryCard
              key={item.key}
              title={item.name}
              amount={item.totalFormatted}
              color={item.color}
            />
          ))}
        </Content>
      )}
    </Container>
  );
}
