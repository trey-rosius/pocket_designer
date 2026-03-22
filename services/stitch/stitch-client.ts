import axios from 'axios';

interface StitchFile {
  downloadUri: string;
}

interface Screen {
  htmlCode?: StitchFile;
  screenshot?: StitchFile;
  [key: string]: any;
}

export class StitchClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.STITCH_API_URL || 'https://stitch.googleapis.com/mcp';
    this.apiKey = process.env.STITCH_API_KEY || '';
    if (!this.apiKey && !process.env.STITCH_API_URL) {
      console.warn('STITCH_API_KEY is not set and no STITCH_API_URL provided');
    }
  }

  async callTool(name: string, args: any): Promise<any> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name,
            arguments: args,
          },
          id: Date.now(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
          },
        }
      );

      const result = response.data.result;
      if (!result) {
        throw new Error(`Stitch API returned no result: ${JSON.stringify(response.data)}`);
      }

      if (result.isError) {
        throw new Error(`Stitch Tool Error: ${JSON.stringify(result.content)}`);
      }

      // Handle structuredContent if available, otherwise parse text content
      if (result.structuredContent && Object.keys(result.structuredContent).length > 0) {
        return result.structuredContent;
      }

      const textContent = result.content?.find((c: any) => c.type === 'text');
      if (textContent) {
        try {
          return JSON.parse(textContent.text);
        } catch {
          return textContent.text;
        }
      }

      return result;
    } catch (error: any) {
      console.error(`Error calling Stitch tool ${name}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generates a design prototype from a text prompt.
   */
  async generatePrototype(prompt: string): Promise<string> {
    console.log(`Generating Stitch prototype for prompt: ${prompt}`);
    
    // 1. Create a project with a unique title to avoid collisions
    const project = await this.callTool("create_project", { 
      title: `Agent Project ${Date.now()}` 
    });
    const projectId = project.name.replace("projects/", "");
    
    // 2. Generate a screen
    let screen = await this.callTool("generate_screen_from_text", {
      projectId,
      prompt,
    });
    
    // 3. Handle conversational responses (where model asks for confirmation instead of generating)
    if (!screen.name && !screen.result?.name && screen.outputComponents) {
      const suggestion = screen.outputComponents.find((c: any) => c.suggestion)?.suggestion;
      if (suggestion) {
        console.log(`Conversational response received. Following first suggestion: ${suggestion}`);
        screen = await this.callTool("generate_screen_from_text", {
          projectId,
          prompt: suggestion,
        });
      }
    }
    
    const screenName = screen.name || screen.result?.name;
    if (!screenName) {
      throw new Error(`Failed to get screen name from generate_screen_from_text response: ${JSON.stringify(screen)}`);
    }

    console.log(`Successfully generated Stitch screen: ${screenName}`);
    return screenName;
  }

  /**
   * Downloads a design prototype (HTML content).
   */
  async downloadDesign(screenName: string): Promise<string> {
    console.log(`Downloading Stitch design for screen: ${screenName}`);
    
    const parts = screenName.split('/');
    const projectId = parts[1];
    const screenId = parts[3];
    
    // 1. Get the screen details via MCP to get the HTML code file reference
    const screen = await this.callTool("get_screen", { 
      name: screenName,
      projectId,
      screenId 
    }) as Screen;

    const htmlCode = screen.htmlCode;
    if (!htmlCode || !htmlCode.downloadUri) {
      throw new Error(`No HTML code found for screen ${screenName}. Result: ${JSON.stringify(screen)}`);
    }

    // 2. Fetch the actual HTML from the downloadUri
    const resp = await axios.get(htmlCode.downloadUri, {
      headers: { 
        'X-Goog-Api-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });
    
    return Buffer.from(resp.data).toString('utf-8');
  }

  /**
   * Downloads a screenshot image artifact.
   */
  async downloadScreenshot(screenName: string): Promise<Buffer> {
    console.log(`Downloading Stitch screenshot for screen: ${screenName}`);
    
    const parts = screenName.split('/');
    const projectId = parts[1];
    const screenId = parts[3];
    
    const screen = await this.callTool("get_screen", { 
      name: screenName,
      projectId,
      screenId 
    }) as Screen;

    const screenshot = screen.screenshot;
    if (!screenshot || !screenshot.downloadUri) {
      throw new Error(`No screenshot found for screen ${screenName}. Result: ${JSON.stringify(screen)}`);
    }

    const resp = await axios.get(screenshot.downloadUri, {
      headers: { 
        'X-Goog-Api-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    return Buffer.from(resp.data);
  }

  /**
   * Lists all projects in Stitch.
   */
  async listProjects(): Promise<any[]> {
    console.log('Listing Stitch projects');
    const result = await this.callTool("list_projects", {});
    return result.projects || [];
  }

  /**
   * Lists all screens for a specific project.
   */
  async listScreens(projectId: string): Promise<any[]> {
    console.log(`Listing Stitch screens for project: ${projectId}`);
    const result = await this.callTool("list_screens", { projectId });
    return result.screens || [];
  }

  /**
   * Edits a screen with a specific prompt.
   */
  async editScreen(screenName: string, prompt: string): Promise<any> {
    console.log(`Editing Stitch screen ${screenName} with prompt: ${prompt}`);
    const parts = screenName.split('/');
    const projectId = parts[1];
    const screenId = parts[3];

    return await this.callTool("edit_screens", {
      projectId,
      screenId,
      prompt,
    });
  }

  /**
   * Generates a variant of a screen.
   */
  async generateVariant(screenName: string, prompt?: string, options?: any): Promise<any> {
    console.log(`Generating variant for Stitch screen ${screenName}${prompt ? ` with prompt: ${prompt}` : ''}`);
    const parts = screenName.split('/');
    const projectId = parts[1];
    const screenId = parts[3];

    return await this.callTool("generate_variants", {
      projectId,
      selectedScreenId: screenId,
      prompt,
      variantOptions: options,
    });
  }
}
