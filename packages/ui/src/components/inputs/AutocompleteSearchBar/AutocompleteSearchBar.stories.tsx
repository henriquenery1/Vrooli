import { Meta, Story } from "@storybook/react";
import { AutocompleteSearchBar as Component } from '..';
import { AutocompleteSearchBarProps as Props } from '../types';

// Define story metadata
export default {
    title: 'inputs/AutocompleteSearchBar',
    component: Component,
} as Meta;

// Define template for enabling control over props
const Template: Story<Props<any>> = (args) => <Component {...args} />;

// Export story
export const Default = Template.bind({});