import React from 'react';
import { Box, Text, Center } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DepartmentPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Center h="200px">
        <Text>No data available</Text>
      </Center>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    name: item.department.replace('_', ' '),
    avgResolutionTime: Math.round(item.avgResolutionTime / 60), // Convert minutes to hours
    ticketVolume: item.ticketCount
  }));

  return (
    <Box h="300px" w="100%">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip formatter={(value, name) => {
            if (name === 'avgResolutionTime') return [`${value} hours`, 'Avg. Resolution Time'];
            return [`${value} tickets`, 'Ticket Volume'];
          }} />
          <Legend />
          <Bar yAxisId="left" dataKey="avgResolutionTime" name="Avg. Resolution Time (hours)" fill="#8884d8" />
          <Bar yAxisId="right" dataKey="ticketVolume" name="Ticket Volume" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DepartmentPerformanceChart;
