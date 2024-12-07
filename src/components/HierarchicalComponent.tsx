import React, { useState } from 'react';
import { Node } from '../definitions/types';
import Button from './Button';

const initialData: Node[] = [
  {
    id: 'electronics',
    label: 'Electronics',
    value: 1500,
    children: [
      { id: 'phones', label: 'Phones', value: 800 },
      { id: 'laptops', label: 'Laptops', value: 700 }
    ]
  },
  {
    id: 'furniture',
    label: 'Furniture',
    value: 1000,
    children: [
      { id: 'tables', label: 'Tables', value: 300 },
      { id: 'chairs', label: 'Chairs', value: 700 }
    ]
  }
];

export default function HierarchicalComponent() {
  const [data, setData] = useState<Node[]>(initialData);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const updateParentValues = (updatedData: Node[]): Node[] => {
    const calculateSubtotal = (node: Node): number => {
      if (node.children) {
        node.value = node.children.reduce((sum, child) => {
          return sum + calculateSubtotal(child);
        }, 0);
      }
      return node.value;
    };

    updatedData.forEach((node) => calculateSubtotal(node));
    return updatedData;
  };

  const handleUpdateValue = (
    id: string,
    newValue: number,
    type: 'percentage' | 'absolute'
  ): void => {
    const updateNode = (nodes: Node[]): Node[] => {
      return nodes.map((node: Node) => {
        if (node.id === id) {
          const originalValue = node.value;
          if (type === 'percentage') {
            node.value = Math.round(originalValue * (1 + newValue / 100));
          } else if (type === 'absolute') {
            node.value = newValue;
          }
          node.variance = Math.round(
            ((node.value - originalValue) / originalValue) * 100
          );
        }
        if (node.children) {
          node.children = updateNode(node.children);
        }
        return node;
      });
    };

    const updatedData = updateNode(data);
    console.log('updatedData: ', updatedData);
    setData(updateParentValues(updatedData));
  };

  const addPercentageToNodeAndParents = (
    id: string,
    percentage: number
  ): void => {
    const updateNode = (nodes: Node[]): Node[] => {
      const applyPercentage = (node: Node, percentage: number): number => {
        const originalValue = node.value;
        node.value = Math.round(originalValue * (1 + percentage / 100));
        node.variance = Math.round(
          ((node.value - originalValue) / originalValue) * 100
        );
        return node.value;
      };

      return nodes.map((node) => {
        if (node.id === id) {
          applyPercentage(node, percentage);
        }
        if (node.children) {
          node.children = updateNode(node.children);
          if (node.children.some((child) => child.id === id)) {
            applyPercentage(node, percentage);
          }
        }
        return node;
      });
    };

    const updatedData = updateNode(data);
    setData(updateParentValues(updatedData));
  };

  const handleInputChange = (id: string, value: string): void => {
    setInputValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddPercentage = (row: Node) => {
    const inputValue = parseFloat(inputValues[row.id]);
    if (inputValue) addPercentageToNodeAndParents(row.id, inputValue);
  };

  const handleUpdateNodeValue = (row: Node) => {
    const inputValue = parseFloat(inputValues[row.id]);
    if (inputValue) handleUpdateValue(row.id, inputValue, 'absolute');
  };

  const renderRows = (rows: Node[], isChild = false) => {
    return rows.map((row: Node) => (
      <React.Fragment key={row.id}>
        <tr>
          <td style={{ paddingLeft: isChild ? '20px' : '0px' }}>
            {isChild ? '-- ' : ''}
            {row.label}
          </td>
          <td>{row.value}</td>
          <td>
            <input
              name={row.id}
              type="number"
              placeholder="Enter value"
              value={inputValues[row.id] || ''}
              onChange={(e) => handleInputChange(row.id, e.target.value)}
            />
          </td>
          <td>
            <Button
              name="Allocate %"
              onClick={() => {
                handleAddPercentage(row);
              }}
            />
          </td>
          <td>
            <Button
              name="Allocate Value"
              onClick={() => {
                handleUpdateNodeValue(row);
              }}
            />
          </td>
          <td>{row.variance || 0}%</td>
        </tr>
        {row.children && renderRows(row.children, true)}
      </React.Fragment>
    ));
  };

  return (
    <div className="App">
      <h1>Sales Table</h1>
      <table
        border={1}
        style={{ width: '80%', margin: 'auto' }}
      >
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>Input</th>
            <th>Allocation %</th>
            <th>Allocation Val</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>{renderRows(data)}</tbody>
      </table>
    </div>
  );
}
