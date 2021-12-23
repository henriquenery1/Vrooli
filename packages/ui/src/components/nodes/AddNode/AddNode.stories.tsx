import { Meta, Story } from "@storybook/react";
import { AddNode as Component } from '../';
import { AddNodeProps as Props } from '../types';

// Define story metadata
export default {
    title: 'nodes/AddeNode',
    component: Component,
} as Meta;

// Define template for enabling control over props
const Template: Story<Props> = (args) => <Component {...args} />;

// Export story
export const Default = Template.bind({});